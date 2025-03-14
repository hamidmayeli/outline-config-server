interface IServerInfo {
    name: string;
    serverId: string;
    metricsEnabled: boolean;
    createdTimestampMs: number;
    version: string;
    portForNewAccessKeys: number;
    hostnameForAccessKeys: string;
}

interface IServerDto {
    id: string;
    name: string;
}

interface IAccessKeyResponse {
    id: string;
    name: string;
    accessUrl: string;
    dataLimit: {
        bytes?: number | null;
        consumed: number;
    };
    configUrl?: string;
    cfUrl?: string;
}

interface INewServerDto {
    apiUrl: string;
    certSha256: string;
    copyFrom?: string;
}
