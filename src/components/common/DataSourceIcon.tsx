import React from 'react'
import Svg, { Path, Rect } from "react-native-svg"


export const DataSourceIcon = (props: { type: 'step' | 'sleep' | 'weight' | 'heartrate', color: string, size?: number }) => {
    const size = props.size || 24
    switch (props.type) {
        case 'weight':
            return <Svg width={size} height={size} viewBox="0 0 48.94 48.94">
                <Path fill={props.color} d="M41.29,0H7.65A7.64,7.64,0,0,0,0,7.65V41.29a7.64,7.64,0,0,0,7.65,7.65H41.29a7.64,7.64,0,0,0,7.65-7.65V7.65A7.64,7.64,0,0,0,41.29,0Zm-2,18.83a2.63,2.63,0,0,1-2.63,2.63H12.29a2.63,2.63,0,0,1-2.63-2.63V7.58A2.63,2.63,0,0,1,12.29,5H36.65a2.63,2.63,0,0,1,2.63,2.63Z" />
                <Path fill={props.color} d="M15.28,8a2.86,2.86,0,0,0-2,.81,3,3,0,0,0-.92,2.32V16a3,3,0,0,0,.92,2.32,2.92,2.92,0,0,0,2,.82,3,3,0,0,0,2.07-.82A3.15,3.15,0,0,0,18.24,16V11.14a3.16,3.16,0,0,0-.89-2.33A2.9,2.9,0,0,0,15.28,8Zm1.47,7.86q0,1.66-1.47,1.68t-1.47-1.68V11.23c0-1.1.51-1.65,1.47-1.67s1.44.57,1.47,1.67Z" />
                <Path fill={props.color} d="M22.54,8a2.86,2.86,0,0,0-2,.81,3,3,0,0,0-.92,2.32V16a3,3,0,0,0,.92,2.32,2.92,2.92,0,0,0,2,.82,3,3,0,0,0,2.07-.82A3.07,3.07,0,0,0,25.5,16V11.14a3.08,3.08,0,0,0-.89-2.33A2.9,2.9,0,0,0,22.54,8ZM24,15.86q0,1.66-1.47,1.68t-1.47-1.68V11.23c0-1.1.51-1.65,1.47-1.67S24,10.13,24,11.23Z" />
                <Rect fill={props.color} x="27.3" y="17.45" width="1.49" height="1.56" />
                <Path fill={props.color} d="M33.43,8a2.82,2.82,0,0,0-2,.81,3,3,0,0,0-.93,2.32V16a3,3,0,0,0,.93,2.32,2.87,2.87,0,0,0,2,.82,3,3,0,0,0,2.07-.82A3.11,3.11,0,0,0,36.4,16V11.14a3.12,3.12,0,0,0-.9-2.33A2.9,2.9,0,0,0,33.43,8Zm1.47,7.86c0,1.11-.52,1.67-1.47,1.68S32,17,32,15.86V11.23c0-1.1.51-1.65,1.47-1.67s1.45.57,1.47,1.67Z" />
            </Svg>

        case 'step':
            return <Svg width={size} height={size} viewBox="0 0 41.83 56.57">
                <Path fill={props.color} d="M16.33,11C16.56,9.44,15.65-1.58,7.19.19-5.24,2.8,1.86,25.41,3.52,28.25l11-2.07C13.7,20.55,15.5,16.4,16.33,11Z" />
                <Path fill={props.color} d="M4,31.56c.92,4,1.31,11.48,8.53,10.06,8-1.57,3.43-9.11,2.72-12.31Z" />
                <Path fill={props.color} d="M34.64,15c-8.46-1.77-9.38,9.25-9.14,10.77.82,5.44,2.63,9.59,1.85,15.22l11,2.07C40,40.18,47.07,17.57,34.64,15Z" />
                <Path fill={props.color} d="M29.31,56.39c7.22,1.42,7.61-6.08,8.52-10.06L26.59,44.08C25.88,47.28,21.29,54.82,29.31,56.39Z" />
            </Svg>

        case 'heartrate':
            return <Svg width={size} height={size} viewBox="0 0 52.91 48.54">
                <Path fill={props.color} d="M12.6,21.15l4.48-9.1a1.5,1.5,0,0,1,1.34-.84h0a1.53,1.53,0,0,1,1.35.87L27.11,27.9,32.4,16a1.51,1.51,0,0,1,2.69-.12l2.61,4.73h14a17,17,0,0,0,1.16-6.07A14.41,14.41,0,0,0,38.36,0,15.86,15.86,0,0,0,26.45,5.53,15.82,15.82,0,0,0,14.55,0,14.41,14.41,0,0,0,0,14.55a17.26,17.26,0,0,0,1.37,6.6Z"/>
                <Path fill={props.color} d="M36.82,23.62a1.49,1.49,0,0,1-1.31-.77L33.92,20,28.51,32.14a1.5,1.5,0,0,1-1.36.89h0a1.51,1.51,0,0,1-1.36-.87l-7.39-16-3.5,7.13a1.51,1.51,0,0,1-1.35.83H2.85c3.68,6.3,10.68,12.67,19.77,20.9l3.83,3.49,3.84-3.46c9.34-8.49,16.5-15,20.09-21.46Z"/>
            </Svg>

        case 'sleep':
            return <Svg width={size} height={size} viewBox="0 0 57.96 47.2">
                <Path fill={props.color} d="M11.29,10.64a3,3,0,0,1,3-3H22.8a3,3,0,0,1,3,3v3.51h6.32V10.64a3,3,0,0,1,3-3h8.49a3,3,0,0,1,3,3v3.51h4.41V2.8A2.8,2.8,0,0,0,48.28,0H9.68a2.8,2.8,0,0,0-2.8,2.8V14.15h4.41Z"/>
                <Path fill={props.color} d="M55.05,17.61H2.91A2.91,2.91,0,0,0,0,20.52V47.2H3.82V41.4H54.14v5.8H58V20.52A2.91,2.91,0,0,0,55.05,17.61Z"/>
            </Svg>
    }
}