  const success = gl.getShaderParameter(
    shader,
    gl.COMPILE_STATUS
  );

  if (!success) {
    const log = gl.getShaderInfoLog(shader);
    const kind = type === gl.VERTEX_SHADER
      ? "vertex"
      : "fragment";

    gl.deleteShader(shader);

    throw new Error(`Error in ${kind} shader: ${log}`);
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(
    program,
    gl.LINK_STATUS
  );

  if (!success) {
    const log = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);

    throw new Error(`Error while linking program: ${log}`);
  }

  return program;
}

function makeRender(gl, colorUniformLocation) {
  return (objects)  => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    objects.forEach(({ components, primitive, color }) => {
      gl.uniform4f(colorUniformLocation, ...color);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(components),
        gl.STATIC_DRAW
      );
      gl.drawArrays(
        primitive,
        0,
        components.length / 2
      );
    });
  };
}

function getBasis(unitsPerAxe) {
  const semiAxisUnits = unitsPerAxe / 2;
  const axes = {
    primitive: WebGLRenderingContext.LINES,
    color: [0.2, 0.2, 0.2, 1],
    components: [
      -semiAxisUnits, 0,
      semiAxisUnits, 0,
      0, semiAxisUnits,
      0, -semiAxisUnits
    ]
  };

  for (let i = -semiAxisUnits; i < semiAxisUnits; ++i) {
    axes.components.push(i, 0.06, i, -0.06); // x mark
    axes.components.push(-0.06, i, 0.06, i); // y mark
  }

  return axes;
}

function drawCartesian(exprX, exprY, unitsPerAxe, render) {
  
const components = [];

for (let t = -1000; t < 1000; t += 0.05) {
const y = exprY.eval({ t });
components.push(t, y);
}

draw(components, unitsPerAxe, render);
}

function drawPolar(exprX, exprY, unitsPerAxe, render) {
  const components = [];

  for (let t = -1000; t < 1000; t += 0.01) {
    const angle = exprY.eval({ t });
    const radius = exprY.eval({ t });

    if (radius < 0) {
      continue;
    }

    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    components.push(x, y);
  }

  draw(components, unitsPerAxe, render);
}


function draw(components, unitsPerAxe, renderFunc) {
  return renderFunc([
    getBasis(unitsPerAxe),
    {
      primitive: WebGLRenderingContext.LINE_STRIP,
      color: [ 0.1, 0.5, 0.1, 1 ],
      components
    }
  ]);
}
