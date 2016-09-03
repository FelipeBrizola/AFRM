# Angular Starter Project

> Projeto de scaffolding, para facilitar a criação de novos projetos Front-end baseados em AngularJS

<br>
## Passos para inicializar um novo projeto

<br>
#### Passo 1: baixar o projeto

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Baixe aqui o TAR/GZIP do projeto e descompacte na pasta do seu novo projeto.

<br>
#### Passo 2: configurando arquivos de repositório do projeto

* **```./package.json``` e ```./bower.json```**
    * **'name'**: Nome do projeto, utilize o mesmo do repositório;
    * **'description'**: Descrição do seu novo projeto;
    * **'author'**: Nome do autor;
    * **'homepage'**: URL de produção ou se não houver utilizar do repositório no github;
    * **'repository.url'**: URL do repositório no github;
    * **'bugs'**: URL das issues do repositório no github;

* **```./app.json```**
    * **'name'**: Nome do projeto, utilize o mesmo do repositório;

* **```./conf.json```**
    * **'def_api_app'**: Nome do projeto, utilize o mesmo do repositório;
    * **'menu'**: Árvore de menu do projeto, valores serão exibidos logo abaixo da Topbar do projeto, exemplo:
        ``` javascript
            "menu": [
            {
                "name"  : "Home",
                "route" : "/home",
                "icon"  : "myaccount"
            }
        ```

* **```./server.js```**
    * alterar **nomeDoSeuProjetoApp** no ```console.log``` para informar o nome da sua aplicação;


<br>
#### Passo 3: [Gulp](http://gulpjs.com/)

> Antes de qualquer você deve alterar duas configurações no ```gulpfile.js```

* altere a constant **APP_PREFIX** do seu ```gulpfile.js```para o mesmo nome do seu repositório, exemplo: **nomeDoSeuProjetoApp**
* altere a porta ```port``` referente no ```gulpfile.js``` onde estão declaradas as constantes, localize ```CONNECT_SERVER``` e altere para porta desejada
  * ``` javascript
CONNECT_SERVER = {
    'port'       : 9999,
    'livereload' : true
},
<br>
Temos diversas tarefas configuradas no gulp para facilitar o workflow de desenvolvimento, segue relação abaixo:

---

* **gulp || gulp all**: e tarefas de **test** e **build**;
* **gulp || gulp test**: valida o eslint da aplicação;
* **gulp || gulp build**:
  * Bundling e minify de todos os arquivos JS e CSS sendo copiados para ```./dist```;
  * Bundling e minify de todos os arquivos CSS, sendo copiados para ```./assets/css```;
  * Copia os assets ```[ 'assets/**/img/*.*', 'assets/**/icons/*.*' ]``` para ```./assets/**```;
* **gulp || gulp all**: irá executar tarefas de **test** e **build**
* **gulp dev**:
  * Remove a pasta ```./dist ```;
  * Executa 'build';
  * Levanta o **livereload** no endereço e porta referente ex: **http://localhost:5000**;
  * Coloca watch em todos os arquivos de desenvolvimento:
    * Recarrega toda a aplicação: ```[ './app/**/*.*', './assets/**/*.*' ]```
    * Recarrega apenas template: ```[ 'index.html', 'conf.json', './app/**/*.html' ]```


<br>
#### Passo 4: configurar arquivos de projeto

* Alterar o nome do módulo **"nomeDoSeuProjetoApp"** angular no topo do arquivo HTML **./index.html** ```<html plg-app="nomeDoSeuProjetoApp" src="conf.json">```
* Alterar o ```<title>Pling :: nomeDoSeuProjetoApp</title>```
* Alterar a referência css: ```<link rel="stylesheet" href="dist/assets/nomeDoSeuProjetoApp.min.css">```
* Alterar a referência script: ```<script type="text/javascript" src="dist/nomeDoSeuProjetoApp.min.js"></script>```

<br>

#### Passo 5: testar se tudo deu certo

* Instale as dependências do projeto: ```npm install```

* Se você já estiver com o ```gulp``` instalado globalmente ```npm install gulp -g``` execute:
  * comando para limpar as pastas de build: ``` gulp clean ```.
  * comando para build e tentar levantar o live reload: ``` gulp dev ```.

Caso o erro: ``` Error: ENOENT: no such file or directory``` apareça, pressione ```ctrl + c``` para cancelar e rode novamente o comando ```gulp dev```.

Se tudo deu certo você deverá ver a mensagem no teu terminal: **```Server started http://localhost:SUA_PORTA```**.

Acesse o browser na url acima, **bora codar**!

## Termos & Licença

Copyright 2016 Pling - Plataforma Integrada de Gestão LTDA
