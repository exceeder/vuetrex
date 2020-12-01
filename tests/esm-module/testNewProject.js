const { execSync } = require('child_process');

const inlinePreset = {
    "useConfigFiles": true,
    "plugins": {
        "@vue/cli-plugin-typescript": {
            "classComponent": false
        }
    },
    "vueVersion": "3"
};

const appTemplateName = 'tests/esm-module/TestApp.vue'
const projectName = 'test'+Math.floor(Math.random()*1000)

execSync(`mkdir -p temp && rm -rf temp/${projectName} && \\
            cd temp && \\
            vue create --no-git --force --bare --inlinePreset='${JSON.stringify(inlinePreset)}' \\
            ${projectName}`,
    {stdio: 'inherit'})

execSync(`cd temp/${projectName} && \\
        npm install three @exceeder/vuetrex && \\
        cp ../../${appTemplateName} src/App.vue && \\
        npm run serve`,
    {stdio: 'inherit'})