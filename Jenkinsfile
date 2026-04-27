// Jenkinsfile — ROKE Industries Frontend
pipeline {
    agent {
        docker {
            image 'roke-jenkins-agent:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            reuseNode true
        }
    }

    environment {
        DEPLOY_HOST = '100.124.151.68'
        DEPLOY_USER = 'rokecore'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    parameters {
        choice(
            name: 'TARGET',
            choices: ['portal-staging', 'admin-staging', 'portal-produccion', 'admin-produccion'],
            description: '''Que quieres construir y desplegar?
  portal-staging    → app.rokeindustries.dev
  admin-staging     → admin.rokeindustries.dev
  portal-produccion → app.rokeindustries.com
  admin-produccion  → admin.rokeindustries.com'''
        )
        booleanParam(
            name: 'SOLO_BUILD',
            defaultValue: false,
            description: 'true = solo construir, NO desplegar (para probar el build)'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh '''
                    echo "Branch:  $(git rev-parse --abbrev-ref HEAD)"
                    echo "Commit:  $(git rev-parse --short HEAD)"
                    echo "Mensaje: $(git log -1 --pretty=format:'%s')"
                '''
            }
        }

        stage('Validar branch') {
            steps {
                script {
                    def branch = sh(returnStdout: true,
                        script: "git rev-parse --abbrev-ref HEAD").trim()
                    def isProduccion = params.TARGET.contains('produccion')

                    if (isProduccion && branch != 'master') {
                        error("Produccion solo se puede deployar desde master. Branch actual: ${branch}")
                    }
                    if (!isProduccion && branch != 'develop') {
                        error("Staging solo se puede deployar desde develop. Branch actual: ${branch}")
                    }

                    echo "Branch: ${branch} | Target: ${params.TARGET}"
                }
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh '''
                    corepack enable
                    corepack prepare pnpm@10.4.1 --activate
                    pnpm install --frozen-lockfile
                '''
            }
        }

        stage('Lint') {
            steps {
                sh 'pnpm lint || true'
            }
        }

        stage('Obtener .env del servidor') {
            steps {
                script {
                    def isProduccion = params.TARGET.contains('produccion')
                    def isAdmin      = params.TARGET.contains('admin')
                    def envPath      = isProduccion
                        ? '/opt/apps/portal/.env.production'
                        : '/opt/apps/portal-staging/.env.staging'

                    sshagent(credentials: ['roke-ssh-key']) {
                        sh """
                            scp -o StrictHostKeyChecking=no \
                                ${DEPLOY_USER}@${DEPLOY_HOST}:${envPath} .env
                            echo ".env descargado desde el servidor:"
                            grep -E "VITE_API_URL|VITE_REVERB_HOST|VITE_APP_NAME" .env
                        """
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    def buildScript = ''

                    switch(params.TARGET) {
                        case 'portal-staging':
                            buildScript = 'pnpm build:portal:staging'
                            break
                        case 'admin-staging':
                            buildScript = 'pnpm build:admin:staging'
                            break
                        case 'portal-produccion':
                            buildScript = 'pnpm build:portal'
                            break
                        case 'admin-produccion':
                            buildScript = 'pnpm build:admin'
                            break
                    }

                    echo "Ejecutando: ${buildScript}"
                    sh buildScript

                    // Verificar que el build generó archivos
                    def isAdmin = params.TARGET.contains('admin')
                    def distDir = isAdmin ? 'dist-admin' : 'dist-portal'
                    sh """
                        test -d ${distDir} && echo "Build exitoso en ${distDir}/"
                        test -f ${distDir}/index.html && echo "index.html presente"
                        du -sh ${distDir}/
                    """
                }
            }
            post {
                success {
                    script {
                        def isAdmin = params.TARGET.contains('admin')
                        def distDir = isAdmin ? 'dist-admin' : 'dist-portal'
                        archiveArtifacts artifacts: "${distDir}/**/*", fingerprint: true
                    }
                }
            }
        }

        stage('Confirmar deploy a produccion') {
            when {
                allOf {
                    expression { params.TARGET.contains('produccion') }
                    expression { !params.SOLO_BUILD }
                }
            }
            steps {
                script {
                    def url = params.TARGET == 'portal-produccion'
                        ? 'https://app.rokeindustries.com'
                        : 'https://admin.rokeindustries.com'

                    input(
                        message: "Confirmas deploy a PRODUCCION?\n\nDestino: ${url}\nCommit: ${sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()}",
                        ok: 'Si, desplegar',
                        submitter: 'admin'
                    )
                }
            }
        }

        stage('Deploy') {
            when {
                expression { !params.SOLO_BUILD }
            }
            steps {
                script {
                    def isAdmin      = params.TARGET.contains('admin')
                    def isProduccion = params.TARGET.contains('produccion')
                    def distDir      = isAdmin ? 'dist-admin' : 'dist-portal'

                    def deployPath = ''
                    def deployUrl  = ''

                    switch(params.TARGET) {
                        case 'portal-staging':
                            deployPath = '/opt/apps/portal-staging'
                            deployUrl  = 'https://app.rokeindustries.dev'
                            break
                        case 'admin-staging':
                            deployPath = '/opt/apps/admin-staging'
                            deployUrl  = 'https://admin.rokeindustries.dev'
                            break
                        case 'portal-produccion':
                            deployPath = '/opt/apps/portal'
                            deployUrl  = 'https://app.rokeindustries.com'
                            break
                        case 'admin-produccion':
                            deployPath = '/opt/apps/admin'
                            deployUrl  = 'https://admin.rokeindustries.com'
                            break
                    }

                    echo "Desplegando ${distDir}/ → ${deployPath}/ ..."

                    sshagent(credentials: ['roke-ssh-key']) {
                        sh """
                            rsync -avz --delete \
                                -e "ssh -o StrictHostKeyChecking=no" \
                                ${distDir}/ \
                                ${DEPLOY_USER}@${DEPLOY_HOST}:${deployPath}/
                        """

                        // Reload nginx solo en produccion
                        if (isProduccion) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    ${DEPLOY_USER}@${DEPLOY_HOST} \
                                    "sudo /usr/bin/systemctl reload nginx"
                            """
                        }
                    }

                    echo "Desplegado exitosamente en: ${deployUrl}"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completado: ${params.TARGET}"
        }
        failure {
            echo "Pipeline fallo en stage: ${env.STAGE_NAME}"
        }
        cleanup {
            sh 'rm -f .env 2>/dev/null || true'
            cleanWs()
        }
    }
}