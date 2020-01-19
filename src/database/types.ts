export interface IDatumBase{
    value: number,
    measureCode: string,
    subjectToChange: boolean,
}

export interface IPointDatum extends IDatumBase{
    measuredAt: Date
}

export interface ISessionDatum extends IDatumBase{
    duration: number
    startedAt: Date
    endedAt: Date
}

export interface IHourlyStepBin extends IDatumBase{
    startedAt: Date
}


export interface IHeartRatePoint extends IPointDatum {
    
}

export interface IWeightPoint extends IPointDatum{
    measuredUsing: string
}

export interface IWorkoutSession extends ISessionDatum{
    activityType: string
    //value: intensity
}

export interface ISleepSession extends ISessionDatum{ 
    //value: sleep efficiency
}

export interface ICachedRegion{
    startedAt: Date,
    endedAt: Date,
    measureCode: string
}

export interface IUserDatabaseManager{
    queryData<T extends IDatumBase>(measureCode: string, from: number, to: number): Promise<Array<T>>
    clearCache(measureCode: string)

}