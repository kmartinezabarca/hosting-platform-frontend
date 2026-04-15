/**
 * Pipeline CI/CD — ROKE Industries Frontend
 *
 * Triggers:
 *   - Cada PR contra master o develop → lint + test
 *   - Push a develop → build staging
 *   - Push a master → build production + deploy
 *
 * Requisitos en Jenkins:
 *   - Node.js 20+ instalado (o usar Docker agent)
 *   - Credencial 'roke-env-staging'  → archivo .env.staging
 *   - Credencial 'roke-env-prod'     → archivo .env.production
 *   - Credencial 'sentry-auth-token' → SENTRY_AUTH_TOKEN
 *   - Plugin: NodeJS Plugin, Credentials Binding, GitHub Branch Source
 */

pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args  '-u root'
    }
  }

  environment {
    PNPM_VERSION   = '10.4.1'
    NODE_ENV       = 'test'
    CI             = 'true'
    // Playwright solo instala chromium en CI para ahorrar espacio
    PLAYWRIGHT_BROWSERS_PATH = '0'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  stages {

    // ─── Setup ─────────────────────────────────────────────────────────────
    stage('Setup') {
      steps {
        sh 'npm install -g pnpm@${PNPM_VERSION}'
        sh 'pnpm --version'
        sh 'pnpm install --frozen-lockfile'
      }
    }

    // ─── Lint ──────────────────────────────────────────────────────────────
    stage('Lint') {
      steps {
        sh 'pnpm lint'
      }
      post {
        failure {
          echo 'Lint fallido. Revisa los errores de ESLint antes de hacer merge.'
        }
      }
    }

    // ─── Unit Tests (Vitest) ───────────────────────────────────────────────
    stage('Unit Tests') {
      steps {
        sh 'pnpm test:coverage'
      }
      post {
        always {
          // Publicar reporte de cobertura en Jenkins
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'coverage',
            reportFiles: 'index.html',
            reportName: 'Vitest Coverage'
          ])
        }
        failure {
          echo 'Tests unitarios fallados. Ver reporte de cobertura.'
        }
      }
    }

    // ─── E2E Tests (Playwright) — solo en PRs y branches principales ───────
    stage('E2E Tests') {
      when {
        anyOf {
          branch 'master'
          branch 'develop'
          changeRequest()
        }
      }
      environment {
        E2E_BASE_URL = 'http://localhost:4173'
      }
      steps {
        // Instalar solo Chromium para CI
        sh 'npx playwright install chromium --with-deps'
        // Compilar y previsulaizar la app antes de los E2E
        sh 'pnpm build'
        sh 'pnpm preview &'
        sh 'sleep 5'
        // Ejecutar solo tests que no requieren backend real
        sh 'pnpm e2e --project=chromium --grep-invert "flujo exitoso"'
      }
      post {
        always {
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'e2e-report',
            reportFiles: 'index.html',
            reportName: 'Playwright E2E Report'
          ])
          archiveArtifacts artifacts: 'e2e-report/**', allowEmptyArchive: true
        }
      }
    }

    // ─── Build Staging ─────────────────────────────────────────────────────
    stage('Build Staging') {
      when {
        branch 'develop'
      }
      steps {
        withCredentials([file(credentialsId: 'roke-env-staging', variable: 'ENV_FILE')]) {
          sh 'cp $ENV_FILE .env.production'
        }
        sh 'pnpm build:staging'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    // ─── Build Production ──────────────────────────────────────────────────
    stage('Build Production') {
      when {
        branch 'master'
      }
      steps {
        withCredentials([
          file(credentialsId: 'roke-env-prod', variable: 'ENV_FILE'),
          string(credentialsId: 'sentry-auth-token', variable: 'SENTRY_AUTH_TOKEN')
        ]) {
          sh 'cp $ENV_FILE .env.production'
          sh 'SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN pnpm build'
        }
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    // ─── Deploy (ajustar según tu infraestructura) ─────────────────────────
    stage('Deploy Staging') {
      when {
        branch 'develop'
      }
      steps {
        echo 'Desplegando en staging...'
        // Ejemplo con rsync a servidor remoto:
        // sh 'rsync -avz --delete dist/ deploy@staging.rokeindustries.com:/var/www/frontend/'
        //
        // Ejemplo con AWS S3:
        // sh 'aws s3 sync dist/ s3://roke-staging-frontend/ --delete'
        //
        // Ejemplo con Docker:
        // sh 'docker build -t roke-frontend:staging . && docker push ...'
        echo 'Staging desplegado exitosamente.'
      }
    }

    stage('Deploy Production') {
      when {
        branch 'master'
      }
      // Requiere aprobación manual antes de producción
      input {
        message 'Aprobar deploy a producción?'
        ok 'Desplegar'
        submitter 'admin,dev-lead'
      }
      steps {
        echo 'Desplegando en producción...'
        // sh 'rsync -avz --delete dist/ deploy@rokeindustries.com:/var/www/frontend/'
        echo 'Producción desplegada exitosamente.'
      }
    }
  }

  // ─── Notificaciones ──────────────────────────────────────────────────────
  post {
    success {
      echo "Pipeline completado exitosamente en rama ${env.BRANCH_NAME}"
      // Aquí puedes agregar notificaciones a Slack/Teams/correo
    }
    failure {
      echo "Pipeline falló en rama ${env.BRANCH_NAME}. Revisar logs."
      // emailext to: 'dev@rokeindustries.com', subject: "FAIL: ${env.JOB_NAME} #${env.BUILD_NUMBER}", body: '...'
    }
    always {
      cleanWs()
    }
  }
}
