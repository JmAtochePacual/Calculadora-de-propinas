// Selectores
const botonGuardarCliente = document.querySelector('#guardar-cliente');


// Variables
const cliente = {
	mesa: '',
	hora: '',
	pedidos: []
};

const categorias = {
	1: 'Comida',
	2: 'Bebidas',
	3: 'Postres'
};


// Guardar un cliente
const init = () => {
	const mesa = document.querySelector('#mesa').value;
	const hora = document.querySelector('#hora').value;

	if ([mesa, hora].includes('')) {
		mostrarAlerta('Todos los campos son obligatorios');
		return;
	};

	asignarDatosCliente(mesa, hora);

	cerrarModal();

	mostrarSecciones();

	obtenerPlatillos();
};

// Mostrar alerta
const mostrarAlerta = (mensaje) => {
	const modalBody = document.querySelector('.modal-body');
	const existeAlerta = document.querySelector('.invalid-feedback');

	if (!existeAlerta) {

		const alerta = document.createElement('p');
		alerta.textContent = mensaje;
		alerta.classList.add('invalid-feedback', 'd-block', 'text-center', 'alerta');
		document.querySelector('.contenido').appendChild(alerta);

		modalBody.appendChild(alerta);

		setTimeout(() => {
			alerta.remove();
		}, 3000);
	}
};


// Asiganar datos cliente
const asignarDatosCliente = (mesa, hora) => {
	cliente.mesa = mesa;
	cliente.hora = hora;
};


// Cierra el modal
const cerrarModal = () => {
	const modalFormulario = document.querySelector('#formulario');
	const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
	modalBootstrap.hide();
};


// Muestra secciones ocultas
const mostrarSecciones = () => {
	const seccionesOcultas = document.querySelectorAll('.d-none');
	seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
};


// Obtiene los platillos de la API
const obtenerPlatillos = () => {
	const URL = `http://localhost:4000/platillos`;

	fetch(URL)
		.then(respuesta => respuesta.json())
		.then(platillos => {
			mostrarPlatillos(platillos);
		})
		.catch(error => console.log(error));
}


// Muestra los platillos en el HTML
const mostrarPlatillos = (platillos) => {
	const contenido = document.querySelector('#platillos');

	platillos.forEach(platillo => {
		const { id, nombre, precio, categoria } = platillo;

		const row = document.createElement('div');
		row.classList.add('row', 'py-3', 'border-top');

		const nombrePlatilloHTML = document.createElement('div');
		nombrePlatilloHTML.textContent = nombre;
		nombrePlatilloHTML.classList.add('col-md-4');

		const precioPlatilloHTML = document.createElement('div');
		precioPlatilloHTML.textContent = `$${precio}`;
		precioPlatilloHTML.classList.add('col-md-3', 'fw-bold');

		const categoriaPlatilloHTML = document.createElement('div');
		categoriaPlatilloHTML.textContent = categorias[categoria];
		categoriaPlatilloHTML.classList.add('col-md-3');

		const inputPlatilloHTML = document.createElement('input');
		inputPlatilloHTML.type = 'number';
		inputPlatilloHTML.value = 0;
		inputPlatilloHTML.min = 0;
		inputPlatilloHTML.id = `producto-${id}`;
		inputPlatilloHTML.classList.add('form-control');
		inputPlatilloHTML.onchange = () => {
			platillo.cantidad = parseInt(inputPlatilloHTML.value);
			gestionarPlatillo(platillo);
		};

		const divInput = document.createElement('div');
		divInput.classList.add('col-md-2');
		divInput.appendChild(inputPlatilloHTML);


		row.append(nombrePlatilloHTML, precioPlatilloHTML, categoriaPlatilloHTML, divInput);
		contenido.appendChild(row);
	});
};


// Agregar platillos al cliente
const gestionarPlatillo = (platillo) => {
	const { id } = platillo;

	// Verificar si la cantidad es mayor a 0
	if (platillo.cantidad === 0) {
		eliminarPlatillo(id);
		actualizarResumen();
		return;
	}

	// Verificar si el platillo ya existe
	tienePlatillo(id)
		? actualizarCantidadPlatillo(platillo)
		: agregarPlatillo(platillo);

	actualizarResumen();
};


// Valida si el platillo ya existe en el array
const tienePlatillo = (id) => cliente.pedidos.some(pedido => pedido.id === id);


// Agrega un platillo al array de pedidos
const agregarPlatillo = (platillo) => {
	cliente.pedidos = [...cliente.pedidos, platillo];
}


// Actualiza la cantidad de un platillo
const actualizarCantidadPlatillo = (platillo) => {
	const pedidosActualizados = cliente.pedidos.map(pedido => pedido.id === platillo.id ? platillo : pedido);
	cliente.pedidos = [...pedidosActualizados];
}


// Elimina un platillo del array de pedidos
const eliminarPlatillo = (id) => {
	cliente.pedidos = cliente.pedidos.filter(pedido => pedido.id !== id);
}


// Actualiza el resumen del cliente
const actualizarResumen = () => {
	limpiarHTML();
	const contenido = document.querySelector('#resumen .contenido');

	tieneContenido()
		? mostrarResumen(contenido)
		: mostrarMensajeDeVacio(contenido);
};


// Limpiar el html previo
const limpiarHTML = () => {
	const contenido = document.querySelector('#resumen .contenido');
	while (contenido.firstChild) {
		contenido.removeChild(contenido.firstChild);
	}
};


// Resetar input
const limpiarInput = (id) => {
	const inputPlatillo = document.querySelector(`#producto-${id}`);
	inputPlatillo.value = 0;
};


// Muestra el resumen del cliente
const mostrarResumen = (contenido) => {

	const resumen = document.createElement('div');
	resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

	const mesa = document.createElement('p');
	mesa.textContent = `Mesa: `;
	mesa.classList.add('fw-bold');

	const mesaSpan = document.createElement('span');
	mesaSpan.textContent = cliente.mesa;
	mesaSpan.classList.add('fw-normal');

	const hora = document.createElement('p');
	hora.textContent = `Hora: `;
	hora.classList.add('fw-bold');

	const horaSpan = document.createElement('span');
	horaSpan.textContent = cliente.hora;
	horaSpan.classList.add('fw-normal');

	const heading = document.createElement('h3');
	heading.textContent = 'Platillos consumidos';
	heading.classList.add('my-4', 'text-center');

	// Agrupar
	const grupo = document.createElement('ul');
	grupo.classList.add('list-group');

	cliente.pedidos.forEach(pedido => {
		const { nombre, cantidad, precio, id } = pedido;

		const lista = document.createElement('li');
		lista.classList.add('list-group-item');

		// Nombre del platillo
		const texto = document.createElement('h4');
		texto.textContent = `${nombre}`;
		texto.classList.add('fw-bold');

		// Catidad del platillo
		const cantidadPlatillo = document.createElement('p');
		cantidadPlatillo.textContent = `Cantidad: `;
		cantidadPlatillo.classList.add('fw-bold');

		const cantidadSpan = document.createElement('span');
		cantidadSpan.textContent = cantidad;
		cantidadSpan.classList.add('fw-normal');

		// Precio del platillo
		const precioPlatillo = document.createElement('p');
		precioPlatillo.textContent = `Precio: `;
		precioPlatillo.classList.add('fw-bold');

		const precioSpan = document.createElement('span');
		precioSpan.textContent = `$${precio}`;
		precioSpan.classList.add('fw-normal');

		// Subtotal
		const subtotal = document.createElement('p');
		subtotal.textContent = `Subtotal: `;
		subtotal.classList.add('fw-bold');

		const subtotalSpan = document.createElement('span');
		subtotalSpan.textContent = `$${precio * cantidad}`;
		subtotalSpan.classList.add('fw-normal');

		const botonEliminar = document.createElement('button');
		botonEliminar.classList.add('btn', 'btn-danger');
		botonEliminar.textContent = 'Eliminar';
		botonEliminar.onclick = () => {
			eliminarPlatillo(id);
			limpiarInput(id);
			actualizarResumen();
		};

		// Asignar elementos span
		cantidadPlatillo.append(cantidadSpan);
		precioPlatillo.append(precioSpan);
		subtotal.append(subtotalSpan);

		lista.append(texto, cantidadPlatillo, precioPlatillo, subtotal, botonEliminar);

		grupo.append(lista);

	});

	mesa.appendChild(mesaSpan);
	hora.appendChild(horaSpan);

	resumen.append(heading, mesa, hora, grupo);

	contenido.appendChild(resumen);
	mostrarFormularioPropinas(contenido);

}


// Muestra mensaje de vacio
const mostrarMensajeDeVacio = (contenido) => {
	const mensaje = document.createElement('p');
	mensaje.textContent = 'Añade los elementos del pedido';
	mensaje.classList.add('text-center', 'fw-bold');
	contenido.appendChild(mensaje);
};


// Verificar si el cliente tiene pedidos
const tieneContenido = () => cliente.pedidos.length > 0;


// Muestra el formulario de propinas en el HTML
const mostrarFormularioPropinas = (contenido) => {

	const formulario = document.createElement('div');
	formulario.classList.add('col-md-6', 'formulario');

	const divFormulario = document.createElement('div');
	divFormulario.classList.add('card', 'py-5', 'px-3', 'shadow');

	const heading = document.createElement('h3');
	heading.textContent = 'Propina';
	heading.classList.add('my-4', 'text-center');

	// Radio buttons 10%
	const radio10 = document.createElement('input');
	radio10.name = 'propina';
	radio10.type = 'radio';
	radio10.value = '10';
	radio10.classList.add('form-check-input');
	radio10.onclick = calcularPropina;

	const label10 = document.createElement('label');
	label10.textContent = '10%';
	label10.classList.add('form-check-label');

	const radio10Div = document.createElement('div');
	radio10Div.classList.add('form-check');
	radio10Div.append(radio10, label10);

	// Radio buttons 25%
	const radio25 = document.createElement('input');
	radio25.name = 'propina';
	radio25.type = 'radio';
	radio25.value = '25';
	radio25.classList.add('form-check-input');
	radio25.onclick = calcularPropina;

	const label25 = document.createElement('label');
	label25.textContent = '25%';
	label25.classList.add('form-check-label');

	const radio25Div = document.createElement('div');
	radio25Div.classList.add('form-check');
	radio25Div.append(radio25, label25);

	// Radio buttons 50%
	const radio50 = document.createElement('input');
	radio50.name = 'propina';
	radio50.type = 'radio';
	radio50.value = '50';
	radio50.classList.add('form-check-input');
	radio50.onclick = calcularPropina;

	const label50 = document.createElement('label');
	label50.textContent = '50%';
	label50.classList.add('form-check-label');

	const radio50Div = document.createElement('div');
	radio50Div.classList.add('form-check');
	radio50Div.append(radio50, label50);

	divFormulario.append(heading, radio10Div, radio25Div, radio50Div);
	formulario.append(divFormulario);
	contenido.appendChild(formulario);
};


// Calcula la propina
const calcularPropina = () => {
	const propinaSeleccionada = Number(document.querySelector('input[name="propina"]:checked').value);
	const subtotal = cliente.pedidos.reduce((total, pedido) => total + pedido.precio * pedido.cantidad, 0);
	const total = subtotal + (subtotal * propinaSeleccionada / 100);
	mostrarTotal(propinaSeleccionada, subtotal, total);
};


// Muestra el total a pagar
const mostrarTotal = (propina, subtotal, total) => {
	// Eliminar el total anterior
	const totalAnterior = document.querySelector('.resultado-pago');
	if (totalAnterior) {
		totalAnterior.remove();
	}

	const subtotalHTML = document.createElement('p');
	subtotalHTML.textContent = `Subtotal: $`;
	subtotalHTML.classList.add('fs-3', 'mt-2', 'fw-bold');

	const subtotalSpan = document.createElement('span');
	subtotalSpan.textContent = subtotal;
	subtotalSpan.classList.add('fw-normal');

	const propinaHTML = document.createElement('p');
	propinaHTML.textContent = `Propina: `;
	propinaHTML.classList.add('fs-3', 'mt-2', 'fw-bold');

	const propinaSpan = document.createElement('span');
	propinaSpan.textContent = `$${(subtotal * propina / 100)}`;
	propinaSpan.classList.add('fw-normal');

	const totalHTML = document.createElement('p');
	totalHTML.textContent = `Total: $`;
	totalHTML.classList.add('fs-3', 'mt-2', 'fw-bold');

	const totalSpan = document.createElement('span');
	totalSpan.textContent = total;
	totalSpan.classList.add('fw-normal');

	const divTotal = document.createElement('div');
	divTotal.classList.add('resultado-pago');

	subtotalHTML.append(subtotalSpan);
	propinaHTML.append(propinaSpan);
	totalHTML.append(totalSpan);

	divTotal.append(subtotalHTML, propinaHTML, totalHTML);

	const formulario = document.querySelector('.formulario > div');
	formulario.appendChild(divTotal);
}


// Cargar Event Listeners
document.addEventListener('DOMContentLoaded', () => {
	botonGuardarCliente.addEventListener('click', init);
});