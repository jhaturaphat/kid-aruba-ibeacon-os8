// export interface BeaconInterface {
    
// }

export interface iBeacon {
    meta: Meta
    reporter: Reporter
    reported: Reported[]
  }
  
  export interface Meta {
    version: string
    access_token: string
    nbTopic: string
  }
  
  export interface Reporter {
    name: string
    mac: string
    ipv4: string
    hwType: string
    swVersion: string
    swBuild: string
    time: string
  }
  
  export interface Reported {
    mac: string
    deviceClass: string[]
    model: string
    lastSeen: string
    bevent: Bevent
    rssi: Rssi
    beacons: Beacon[]
    stats: Stats
    localName: string
  }
  
  export interface Bevent {
    event: string
  }
  
  export interface Rssi {
    max: number
  }
  
  export interface Beacon {
    ibeacon: Ibeacon
  }
  
  export interface Ibeacon {
    uuid: string
    major: number
    minor: number
    power: number
  }
  
  export interface Stats {
    frame_cnt: number
  }
  
