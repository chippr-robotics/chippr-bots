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
