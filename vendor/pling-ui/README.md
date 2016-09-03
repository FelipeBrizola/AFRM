# PlingUI [![Circle CI](https://circleci.com/gh/plingbr/pling-ui.svg?style=shield&circle-token=1d0ad32acb1ca7d33a39642bd7f909f75c720ab9)](https://circleci.com/gh/plingbr/pling-ui)

**PlingUI** é um framework construído a partir do Angular Material (http://material.angularjs.org) no qual utiliza AngularJS para prover o bootstrap da aplicação a fim de construiir aplicações altamente escaláveis.


## Suporte à Browsers

Nosso framework está em pleno funcionamento apenas nas últimas versões dos top browsers, pois nossos modulos utilizam todo o poder do HTML 5, o ideal é que seu browser esteja operando na última versão disponível.

![Chrome](https://cloud.githubusercontent.com/assets/398893/3528328/23bc7bc4-078e-11e4-8752-ba2809bf5cce.png "Google Chrome") | ![Firefox](https://cloud.githubusercontent.com/assets/398893/3528329/26283ab0-078e-11e4-84d4-db2cf1009953.png "Mozilla Firefox") | 
--- | --- | --- | --- | --- |
Último ✔ | Último ✔ | 

## Tarefas automatizadas

Nós utilizamos o [Gulp](http://gulpjs.com/) para automatizar tarefas
Exemplo de execução por comando:

```
gulp <command>
```

### Configuração

1. Instale NodeJS >= [v5.0.0](http://nodejs.org/), caso você não tenha instalado.

2. Instale as dependências globais do projeto:

    ```
[sudo] npm install -g gulp
    ```

3. Instale as dependências locais do projeto:

    ```
npm install
    ```

4. Modo de desenvolvimento (executa uma aplicação demo que consome PlingUI):
Neste comando você deve setar ```--demo``` e passar o nome do seu componente, isso dirá ao gulp para levantar um http server do seu componente, basta então acessar o browser e navegar até a pasta referente.
    ```
gulp dev --demo plg-nome-componente
    ```

5. Gerando os arquivos de Build do PlingUI:

    ```
gulp build
    ```

6. Gerando os arquivos de Build do PlingUI em uma pasta específica (*Evita a cópia dos mesmo arrastando*):

    ```
gulp build --src C:\Users\...\Desktop\...\vendor\pling-ui
    ```
    
## Time

PlingUI é mantido por um dos times mais FOD%#$%@! do país [developerStars](https://github.com/plingbr/pling-ui/graphs/contributors).

[![Evandro Mello](https://avatars2.githubusercontent.com/u/3782187?v=3&s=70)](https://github.com/evandromello) | [![Ezequiel Mross](https://avatars1.githubusercontent.com/u/6461113?v=3&s=70)](https://github.com/ezequielmross) | [![Felipe Brizola](https://avatars0.githubusercontent.com/u/5969512?v=3&s=70)](https://github.com/FelipeBrizola) | [![Felipe Kautzmann](https://avatars3.githubusercontent.com/u/205932?v=3&s=70)](https://github.com/felipekm) | [![Felipe Achutti](https://avatars0.githubusercontent.com/u/11965581?v=3&s=70)](https://github.com/achutti) | [![Rodolfo Mota](https://avatars2.githubusercontent.com/u/11947679?v=3&s=70)](https://github.com/rodolfogordo10) | [![Tales Baz](https://avatars1.githubusercontent.com/u/6804621?v=3&s=70)](https://github.com/talesbaz) | [![Ivan Stumpf](https://avatars1.githubusercontent.com/u/8162419?v=3&s=70)](https://github.com/istumpf) | [![Eduardo Curcino](https://avatars0.githubusercontent.com/u/8633059?v=3&s=70)](https://github.com/eduardocrn)
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
[Evandro Mello](https://github.com/evandromello) | [Ezequiel Mross](https://github.com/ezequielmross) | [Felipe Brizola](https://github.com/FelipeBrizola) | [Felipe Kautzmann](https://github.com/felipekm) | [Felipe Achutti](https://github.com/achutti) | [Rodolpho Mota](https://github.com/rodolfogordo10) | [Tales Baz](https://github.com/talesbaz) | [Ivan Stumpf](https://github.com/istumpf) | [Eduardo Curcino](https://github.com/eduardocrn)

## Histórico

Descubra todas as versões na view [Releases](https://github.com/plingbr/pling-ui/releases) page.

## Termos e Licença

Copyright 2016 Pling - Plataforma Integrada de Gestão LTDA
