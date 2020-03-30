import { refresh, authorize, revoke, AuthConfiguration } from 'react-native-app-auth';
import { FitbitServiceCore, FitbitDailyActivityHeartRateQueryResult, FitbitDailyActivityStepsQueryResult, FitbitWeightTrendQueryResult, FitbitWeightQueryResult, FitbitSleepQueryResult, FitbitIntradayStepDayQueryResult, FitbitHeartRateIntraDayQueryResult, FitbitUserProfile, FitbitDeviceListQueryResult } from "../types";
import { makeFitbitIntradayActivityApiUrl, makeFitbitHeartRateIntraDayLogApiUrl, makeFitbitWeightTrendApiUrl, makeFitbitWeightLogApiUrl, makeFitbitDayLevelActivityLogsUrl, makeFitbitSleepApiUrl, FITBIT_PROFILE_URL, FITBIT_DEVICES_URL } from "../api";
import { LocalAsyncStorageHelper } from "@utils/AsyncStorageHelper";
import { DataService, UnSupportedReason, ServiceApiErrorType } from "../../DataService";
import { DateTimeHelper } from "@utils/time";
import { FitbitLocalDbManager } from '../sqlite/database';
import { DatabaseParams } from 'react-native-sqlite-storage';
import { parseISO, max } from 'date-fns';
import { SystemError } from '@utils/errors';
import { notifyError } from '@core/logging/ErrorReportingService';


interface FitbitCredential {
    readonly client_secret: string;
    readonly client_id: string;
    readonly redirect_uri: string;
}

const STORAGE_KEY_AUTH_STATE = DataService.STORAGE_PREFIX + 'fitbit:state';
const STORAGE_KEY_USER_TIMEZONE =
    DataService.STORAGE_PREFIX + 'fitbit:user_timezone';

const STORAGE_KEY_USER_MEMBER_SINCE =
    DataService.STORAGE_PREFIX + 'fitbit:user_memberSince';

const STORAGE_KEY_LEFT_QUOTA = DataService.STORAGE_PREFIX + 'fitbit:left_quota';
const STORAGE_KEY_QUOTA_RESET_AT = DataService.STORAGE_PREFIX + 'fitbit:quota_reset_at';


export default class FitbitOfficialServiceCore implements FitbitServiceCore {
    keyOverride?: string;
    nameOverride?: string;
    descriptionOverride?: string;
    thumbnailOverride?: any;

    readonly isQuotaLimited: boolean = true

    getLeftQuota(): Promise<number> {
        return this.localAsyncStorage.getInt(STORAGE_KEY_LEFT_QUOTA)
    }
    getQuotaResetEpoch(): Promise<number> {
        return this.localAsyncStorage.getLong(STORAGE_KEY_QUOTA_RESET_AT)
    }

    private _credential: FitbitCredential = null;
    private _authConfig: AuthConfiguration = null;

    private _fitbitLocalDbManager: FitbitLocalDbManager = null
    private _asyncStorage: LocalAsyncStorageHelper = null

    get fitbitLocalDbManager(): FitbitLocalDbManager {
        if (this._fitbitLocalDbManager == null) {
            this._fitbitLocalDbManager = new FitbitLocalDbManager({
                name: 'fitbit-local-cache.sqlite',
                location: 'default',
            } as DatabaseParams);
        }
        return this._fitbitLocalDbManager;
    }

    get localAsyncStorage(): LocalAsyncStorageHelper {
        if (this._asyncStorage == null) {
            this._asyncStorage = new LocalAsyncStorageHelper("fitbit:official")
        }
        return this._asyncStorage
    }

    private async updateUserProfile(): Promise<boolean> {
        const profile: FitbitUserProfile = await this.fetchFitbitQuery(
            FITBIT_PROFILE_URL,
        );
        if (profile != null) {
            await this.localAsyncStorage.set(
                STORAGE_KEY_USER_TIMEZONE,
                profile.user.timezone,
            );
            await this.localAsyncStorage.set(
                STORAGE_KEY_USER_MEMBER_SINCE,
                DateTimeHelper.fromFormattedString(profile.user.memberSince),
            );
            return true;
        } else return false;
    }

    private _authenticationFlow: Promise<string> | undefined = undefined

    authenticate(): Promise<string> {
        if (this._authenticationFlow == null) {
            this._authenticationFlow = new Promise<string>(async (resolve, reject) => {
                const state = await this.localAsyncStorage.getObject(STORAGE_KEY_AUTH_STATE);
                if (state) {
                    try {
                        console.log("refresh token found. try refreshing it with token...")
                        const newState = await refresh(this._authConfig, {
                            refreshToken: state.refreshToken,
                        });
                        if (newState) {
                            console.log("token refresh succeeded.")
                            await this.localAsyncStorage.set(STORAGE_KEY_AUTH_STATE, newState);
                            resolve(newState.accessToken)
                        }
                    } catch (e) {
                        console.log("token refresh failed. try re-authorize.")
                        console.log(e);
                    }
                }

                try {
                    console.log("try re-authorization.")
                    const newState = await authorize(this._authConfig);
                    await this.localAsyncStorage.set(STORAGE_KEY_AUTH_STATE, newState);
                    resolve(newState.accessToken)
                } catch (e) {
                    console.log("Authorization failed.")
                    console.log(e, JSON.stringify(e))
                    notifyError(e, report => {
                        report.context="Fitbit sign in"
                    })
                    resolve(null);
                }
            }).then(res => {
                this._authenticationFlow = null
                return res
            })
        }

        return this._authenticationFlow
    }

    onCheckSupportedInSystem(): Promise<{ supported: boolean, reason?: UnSupportedReason }> {
        try {
            this._credential = require('@credentials/fitbit.json');
            this._authConfig = {
                issuer: '',
                scopes: ['profile', 'activity', 'weight', 'sleep', 'heartrate', 'settings'],
                clientId: this._credential.client_id,
                clientSecret: this._credential.client_secret,
                redirectUrl: this._credential.redirect_uri,
                serviceConfiguration: {
                    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
                    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
                    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
                },
                additionalParameters: {
                    expires_in: "31536000", // 1 year
                    prompt: "none"
                }
            };
            return Promise.resolve({ supported: true });
        } catch (e) {
            console.log(e);
            return Promise.resolve({
                supported: false,
                reason: UnSupportedReason.Credential,
            });
        }
    }

    async signOut(): Promise<void> {
        console.log('try fitbit sign out');
        const state = await this.localAsyncStorage.getObject(STORAGE_KEY_AUTH_STATE);
        if (state) {
            await revoke(this._authConfig, {
                tokenToRevoke: state.refreshToken,
                includeBasicAuth: true,
            } as any);
            await this.localAsyncStorage.remove(STORAGE_KEY_AUTH_STATE);
            await this.localAsyncStorage.remove(STORAGE_KEY_USER_TIMEZONE);
            await this.localAsyncStorage.remove(STORAGE_KEY_USER_MEMBER_SINCE);
        }
    }

    async getMembershipStartDate(): Promise<number> {
        console.log('get membership start date');
        const cached = await this.localAsyncStorage.getLong(
            STORAGE_KEY_USER_MEMBER_SINCE,
        );
        if (cached) {
            console.log("use cached membership start date")
            return cached;
        } else {
            console.log("no cached membership info. update profile.")
            const updated = await this.updateUserProfile();
            if (updated === true) {
                return this.getMembershipStartDate();
            } else return null;
        }
    }

    async fetchFitbitQuery(url: string): Promise<any> {
        console.log('fetch query for ', url);
        const state = await this.localAsyncStorage.getObject(STORAGE_KEY_AUTH_STATE);
        var accessToken;
        if (state == null || state.accessToken == null) {
            accessToken = await this.authenticate();
        } else accessToken = state.accessToken;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Accept-Language': null, // METRIC
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
        }).then(async result => {
            const quota = result.headers.get('Fitbit-Rate-Limit-Limit');
            const remainedCalls = Number.parseInt(result.headers.get('Fitbit-Rate-Limit-Remaining'));
            const secondsLeftToNextReset = Number.parseInt(result.headers.get(
                'Fitbit-Rate-Limit-Reset',
            ));

            await this.localAsyncStorage.set(STORAGE_KEY_LEFT_QUOTA, remainedCalls)
            await this.localAsyncStorage.set(STORAGE_KEY_QUOTA_RESET_AT, secondsLeftToNextReset * 1000 + Date.now())

            if (result.ok === false) {
                const json = await result.json();
                switch (result.status) {
                    case 401:
                        if (json.errors[0].errorType === 'expired_token') {
                            console.log(
                                'Fitbit token is expired. refresh token and try once again.',
                            );
                            return this.authenticate().then(() => this.fetchFitbitQuery(url));
                        } else throw new SystemError(ServiceApiErrorType.CredentialError, "Access token invalid.");

                    case 429:
                        throw new SystemError(ServiceApiErrorType.QuotaLimitReached, "Quota limit reached.")
                    default:
                        throw { error: result.status };
                }
            } else {
                console.log(
                    'Fitbit API call succeeded. Remaining quota:',
                    remainedCalls + '/' + quota,
                    'next reset:',
                    secondsLeftToNextReset + ' secs.',
                );
                return result.json();
            }
        });
    }

    fetchHeartRateDailySummary(start: number, end: number): Promise<FitbitDailyActivityHeartRateQueryResult> {
        return this.fetchFitbitQuery(makeFitbitDayLevelActivityLogsUrl('activities/heart', start, end))
    }

    fetchStepDailySummary(start: number, end: number): Promise<FitbitDailyActivityStepsQueryResult> {
        return this.fetchFitbitQuery(makeFitbitDayLevelActivityLogsUrl("activities/steps", start, end))
    }

    fetchWeightTrend(start: number, end: number): Promise<FitbitWeightTrendQueryResult> {
        return this.fetchFitbitQuery(makeFitbitWeightTrendApiUrl(start, end))
    }

    fetchWeightLogs(start: number, end: number): Promise<FitbitWeightQueryResult> {
        return this.fetchFitbitQuery(makeFitbitWeightLogApiUrl(start, end))
    }

    fetchSleepLogs(start: number, end: number): Promise<FitbitSleepQueryResult> {
        return this.fetchFitbitQuery(makeFitbitSleepApiUrl(start, end))
    }

    fetchIntradayStepCount(date: number): Promise<FitbitIntradayStepDayQueryResult> {
        return this.fetchFitbitQuery(makeFitbitIntradayActivityApiUrl("activities/steps", date))
    }

    fetchIntradayHeartRate(date: number): Promise<FitbitHeartRateIntraDayQueryResult> {
        return this.fetchFitbitQuery(makeFitbitHeartRateIntraDayLogApiUrl(date))
    }

    readonly getToday = () => {
        return new Date()
    }

    async fetchLastSyncTime(): Promise<{ tracker?: Date, scale?: Date }> {
        const devices: FitbitDeviceListQueryResult = await this.fetchFitbitQuery(FITBIT_DEVICES_URL)
        const trackerTimes = devices.filter(d => d.type === 'TRACKER').map(d => parseISO(d.lastSyncTime))
        const scaleTimes = devices.filter(d => d.type === 'SCALE').map(d => parseISO(d.lastSyncTime))
        return {
            tracker: max(trackerTimes),
            scale: max(scaleTimes)
        }
    }
}