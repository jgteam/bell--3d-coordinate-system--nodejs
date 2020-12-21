# 3D Koordinatensystem (Stack: Node)

💡 Dieses Repo ist im Zusammenhang mit der [besonderen Lernleistung im Fach Informatik von Jannis Günsche](https://github.com/jgteam/bell--paper) entstanden.

## Stack

Es handelt sich hier um eine **MEN**-Stack Applikation.

- M: MariaDB (MySQL, etc) *wurde aus Vereinfachung des Setups nicht benutzt*
- E: Express (NPM-Module)
- N: Nodejs

Weitere Software, welche zum Einsatz kommt:

- mysql (NPM-Module) *wurde aus Vereinfachung des Setups nicht benutzt*
- nodemon (NPM-Module) *aktuell unbenutzt, wurde nur bei der Entwicklung verwendet*
- socket.io (NPM-Module)
- ThreeJS
- ThreeJS: OrbitControls
- ThreeJS: CSS3DRenderer & CSS3DObject
- jQuery

## Installation
```
npm install
```

## Benutzung 
Start server:
```
npm start
``````

## Kompatibilitätshinweis
Diese Webapplikation wurde unter folgenden Bedingungen Entwickelt und ist somit automatisch dafür optimiert:
- Opera Browser
- Viewport von 2520x1309px

💡 Die Performance der 3D-Darstellung kann nach Hardware und Performance-Modus abweichen. Unausreichene Rechenleistung kann dazu führen, dass der *THREE WebGLRenderer* und/oder der *CSS3DRenderer* während der Benutzung abstürzen kann.

Bekannte Probleme:
- Firefox: CSS3D-Elemente werden nicht korrekt dargestellt
- Chrome und Chromium: CSS3D-Elemente verursachen manchmal Grafik-Glitches, welche auch die Darstellung der Browser-Elemente und der Entwicklertools beeinflussen

## WebSockets: Visueller Graph

[(PDF) WebSockets-Graph](docs/websockets-graph.pdf)
|
[(PNG) WebSockets-Graph](docs/websockets-graph.png)

![WebSockets-Graph](docs/websockets-graph.png)
