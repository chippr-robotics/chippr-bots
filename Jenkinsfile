pipeline {
  environment {
    API_IMAGE="chipprbots/bridgette-api"
    V1_IMAGE="chipprbots/bridgette-v1"
    TW_IMAGE="chipprbots/bridgette-twitter"
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

    stage('Documentation build') {
        when{
            changeset "**/packages/docs/*.*"
        }
        steps{
            dir("./packages/docs") {
                sh "make html"
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
                sh "npm i"
                sh "npm run test"
                sh "docker build -t $V1_IMAGE:latest ."  
                sh "docker service update --image $V1_IMAGE:latest --force bridgette_discord"
            }
        } 
    }
   }
  
  stage('Bridgette twitter build') {
        when{
            changeset "**/packages/bridgette-twitter/*.*"
        }
        steps{
            dir("./packages/bridgette-twitter") {
                sh "npm i"
                sh "npm run test"
                sh "docker build -t $TW_IMAGE:latest ."  
                sh "docker service update --image $TW_IMAGE:latest --force bridgette_twitter"
            }
        } 
    }
   }
   
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
