def secrets = 
        [path: 'secret/ETC_MORDOR', 
        engineVersion: 2, 
        secretValues: [ 
            [envVar: 'CG_DATA', vaultKey: 'CG_DATA'],
            [envVar: 'CG_IMAGE', vaultKey: 'CG_IMAGE'],
            [envVar: 'CG_METRIC_PORT', vaultKey: 'CG_METRIC_PORT'],
            [envVar: 'CG_NETWORK', vaultKey: 'CG_NETWORK'],
            [envVar: 'CG_P2P_PORT', vaultKey: 'CG_P2P_PORT'],
            [envVar: 'CG_RPC_PORT', vaultKey: 'CG_RPC_PORT'],
            [envVar: 'CG_WS_PORT', vaultKey: 'CG_WS_PORT'],
            
            [envVar: 'GETH_FLAGS', vaultKey: 'GETH_FLAGS'], 
            [envVar: 'GETH_NOUSB', vaultKey: 'GETH_NOUSB'],     
//GETH RPC            
            [envVar: 'GETH_HTTP', vaultKey: 'GETH_HTTP'],
            [envVar: 'GETH_HTTP_ADDR', vaultKey: 'GETH_HTTP_ADDR'],
            [envVar: 'GETH_HTTP_API', vaultKey: 'GETH_HTTP_API'],
            [envVar: 'GETH_HTTP_PORT', vaultKey: 'GETH_HTTP_PORT'],
            [envVar: 'GETH_HTTP_CORSDOMAIN', vaultKey: 'GETH_HTTP_CORSDOMAIN'],
            [envVar: 'GETH_HTTP_VHOSTS', vaultKey: 'GETH_HTTP_VHOSTS'],
//GETH WS SETTINGS            
            [envVar: 'GETH_WS', vaultKey: 'GETH_WS'],
            [envVar: 'GETH_WS_ADDR', vaultKey: 'GETH_WS_ADDR'],
            [envVar: 'GETH_WS_API', vaultKey: 'GETH_WS_API'],
            [envVar: 'GETH_WS_PORT', vaultKey: 'GETH_WS_PORT'],
            [envVar: 'GETH_WS_ORIGINS', vaultKey: 'GETH_WS_ORIGINS'],
         
//GETH MINE                       
            [envVar: 'GETH_MINE', vaultKey: 'GETH_MINE'],
            [envVar: 'GETH_MINER_ETHERBASE', vaultKey: 'GETH_MINER_ETHERBASE'],
            [envVar: 'GETH_MINER_EXTRADATA', vaultKey: 'GETH_MINER_EXTRADATA'],
//GETH METRICS
            [envVar: 'GETH_METRICS', vaultKey: 'GETH_METRICS'],
            [envVar: 'GETH_METRICS_ADDR', vaultKey: 'GETH_METRICS_ADDR'],
            [envVar: 'GETH_METRICS_PORT', vaultKey: 'GETH_METRICS_PORT'],
        ]
        ]