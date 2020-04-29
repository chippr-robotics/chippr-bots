pipeline {

  environment {
    API_IMAGE="chipprbots/bridgette-api"
    V1_IMAGE="chipprbots/bridgette-v1"
    HOME = '.'
    WEB3_URL='https://www.ethercluster.com/etc'
    LOG_LEVEL='debug'
  }

  agent any

  stages {

    stage('Cloning Git') {
      steps {
        git branch: "staging", url: 'https://github.com/chippr-robotics/chippr-bots'
      }
    }

    stage('Bumping Lerna versions') {
        steps {
            sh 'yarn run new-version'
        }
    }

    stage('Bridgette API build') {
        when{
            changeset "**/packages/bridgette-api/*.*"
        }
        steps{
            dir("./packages/bridgette-api") {
                sh "npm run test"
                sh "docker build -t $API_IMAGE:$BUILD_NUMBER ."
                sh "docker build -t $API_IMAGE:latest ."  
                sh "docker rmi $API_IMAGE:$BUILD_NUMBER"
                sh "docker service update --image $API_IMAGE:latest bridgette_api"
        }
      }
    }

    stage('Common Files build') {
        when{
            changeset "**/packages/common/*.*"
        }
        steps{
            dir("./packages/common") {
                sh "npm publish"
        }
      }
    }

    stage('BridgetteDB build') {
        when{
            changeset "**/packages/bridgetteDB/*.*"
        }
        steps{
            dir("./packages/bridgette-DB") {
                sh "npm run test"
                sh "npm publish"
           }
        }
    }

    stage('Bridgette V1 build') {
        when{
            changeset "**/packages/bridgette-v1/*.*"
        }
        steps{
            dir("./packages/bridgette-v1") {
<<<<<<< HEAD
                withCredentials([string(credentialsId: 'discord_webhook', variable: 'WEBHOOK')]) {
                    sh "npm run test"
                    sh "docker build -t $V1_IMAGE:$BUILD_NUMBER ."
                    sh "docker service update --image $V1_IMAGE:$BUILD_NUMBER bridgette_discord"
                    sh "docker build -t $V1_IMAGE:latest ."  
                    sh "docker rmi $V1_IMAGE:$BUILD_NUMBER"
                }
            } 
        }
     }
  }
   
=======
                sh "npm i"
                sh "npm run test"
                sh "docker build -t $V1_IMAGE:latest ."  
                sh "docker service update --image $V1_IMAGE:latest --force bridgette_discord"
            }
        } 
    }
   }
  
>>>>>>> 6472b71fe329190458aaa3d6b67963fa6e1db4cd
   post {
    changed {
     withCredentials([string(credentialsId: 'discord_webhook', variable: 'WEBHOOK')]) {
        discordSend description: 'Jenkins Pipeline Build', 
        link: BUILD_URL, 
        successful: currentBuild.resultIsBetterOrEqualTo('SUCCESS'), 
        title: JOB_NAME, 
        webhookURL: WEBHOOK
     }
    }
  }
}
