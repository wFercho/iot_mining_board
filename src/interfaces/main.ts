type NodeID = string

export interface INodeIn3D {
    id: NodeID
    zone: {
        type: string | "bocamina" | "tunel" | "extraction",
        name: string
    }
    conections: NodeID[]
    position: {
        x: number,
        y: number,
        z: number
    }
    color: string | null
}

export interface INodeRealTimeData {
    id: NodeID
    variables: {
        type: string,
        value: number,
        unit: string,
        alert: {
            name: string
            color: string
        }
    }[]
}