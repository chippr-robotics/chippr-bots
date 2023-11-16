def secrets = [
        path: 'secret/COMMON', 
        engineVersion: 2, 
        secretValues: [
            [envVar: 'GIT_CRED', vaultKey: 'GIT_CRED'],
            [envVar: 'GIT_URL', vaultKey: 'GIT_URL'],
            [envVar: 'SERVER_URL', vaultKey: 'SERVER_URL']
        ]
        ]
        
def vaultConfiguration = [
    vaultUrl: 'http://192.168.1.135:8200',                     
    vaultCredentialId: 'jenkins-role',
    engineVersion: 2
    ]