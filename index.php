<!DOCTYPE html>
<html>
    <head>
        <script src="gravity-toy.js" type="text/javascript"></script>
        <style>
            * {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                font-size:12px;
            }
            canvas {display:block; background-color:black;cursor:default;}
            html, body { width:100%; height:100%; padding:0;margin:0;}
            menu {position:fixed; bottom:0; left:0; height:280px;}
            menu>button {width:120px;margin-top:5px;padding:5px;}
        </style>
    </head>
    <body>
        <canvas id="field" width="100%" height="100%"></canvas>
        <menu>
            <button onclick="selectedMass = 1">Tiny</button><br/>
            <button onclick="selectedMass = 1000">Small</button><br/>
            <button onclick="selectedMass = 10000">Medium</button><br/>
            <button onclick="selectedMass = 100000">Large</button><br/>
            <button onclick="selectedMass = 1000000">X-Large</button><br/>
            <button onclick="selectedMass = 10000000">Ginormous</button><br/>
            <button onclick="clearCanvas()">Clear</button><br/>
            <button onclick="generateCloud()">Generate Cloud</button><br/>
        </menu>
    </body>
</html>