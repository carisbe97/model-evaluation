pipeline {
    agent any

    tools {
        // Debe coincidir exactamente con el nombre configurado en Manage Jenkins > Tools > NodeJS
        nodejs 'NodeJS-20'
    }

    environment {
        // Recupera el Secret Text con ID 'FIREBASE_TOKEN' guardado en Jenkins Credentials
        FIREBASE_TOKEN = credentials('FIREBASE_TOKEN')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Obteniendo el código fuente...'
                checkout scm
            }
        }

        stage('Verificar Cambio de Versión') {
            steps {
                script {
                    echo 'Comprobando si hubo incremento de versión en package.json respecto a master...'
                    
                    // Aseguramos tener la referencia de master actualizada
                    sh 'git fetch origin master || true'

                    // Script en Node.js para comparar de forma segura los JSON
                    sh '''
                        node -e "
                            const { execSync } = require('child_process');
                            const fs = require('fs');

                            let masterVersion = null;
                            try {
                                const masterPkgRaw = execSync('git show origin/master:package.json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
                                masterVersion = JSON.parse(masterPkgRaw).version;
                            } catch (e) {
                                console.log('Aviso: No se pudo obtener package.json de origin/master (puede ser el primer commit). Se continuará.');
                            }

                            const currentPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                            const currentVersion = currentPkg.version;

                            console.log('----------------------------------------------------');
                            console.log('Versión en master:  ' + (masterVersion || 'N/A'));
                            console.log('Versión en tu PR:   ' + currentVersion);
                            console.log('----------------------------------------------------');

                            if (masterVersion && masterVersion === currentVersion) {
                                console.error('❌ ERROR: La versión en package.json (' + currentVersion + ') no ha cambiado.');
                                console.error('👉 Para desplegar debes incrementar la versión en package.json.');
                                process.exit(1);
                            } else {
                                console.log('✅ ÉXITO: Se detectó cambio de versión (' + (masterVersion || 'inicial') + ' -> ' + currentVersion + '). Continuando pipeline...');
                            }
                        "
                    '''
                }
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando módulos de npm...'
                sh 'npm ci'
            }
        }

        stage('Compilar Angular') {
            steps {
                echo 'Compilando proyecto en modo producción...'
                sh 'npm run build'
            }
        }

        stage('Desplegar en Firebase Hosting') {
            steps {
                echo 'Desplegando en Firebase Hosting...'
                // Usamos npx -y firebase-tools deploy pasando el token de autenticación
                sh 'npx -y firebase-tools deploy --only hosting --token "$FIREBASE_TOKEN"'
            }
        }
    }

    post {
        success {
            echo '🎉 ¡Pipeline completado con éxito! Proyecto compilado y desplegado en Firebase.'
        }
        failure {
            echo '🚨 El pipeline ha fallado. Revisa los logs para ver el motivo.'
        }
    }
}
