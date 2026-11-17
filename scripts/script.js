import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const sizes = {
	width: window.innerWidth - 450,
	height: window.innerHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(6, 6, 5);
const startPosCam = camera.position.clone();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function animate() {
	requestAnimationFrame(animate);

	controls.update();
	renderer.render(scene, camera);
}

animate();

// ----- UI -----
window.addEventListener('resize', () => {
	sizes.width = window.innerWidth - 450;
	sizes.height = window.innerHeight;
	
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
	
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

/*
сложение и вычитание двух и более векторов, вычисление скалярного произведения и определение угла
между двумя векторами, а также нахождение векторного произведения двух векторов
и смешанного произведения трех векторов.
*/

const drawnObjects = [];
const resultText = document.getElementById('result-text');
const drawBtn = document.getElementById('draw-btn');
const colors = ['#ffff00', '#00ffff', '#00ff00', '#ff0000', '#0000ff', '#ffa500'];

function clearScene() {
	drawnObjects.forEach(obj => scene.remove(obj));
	drawnObjects.length = 0;
}

const vectorInputsContainer = document.getElementById('vector-inputs-container');
let vectorCount = 0;

// Создания панели для одного вектора
function createVectorPanel(id, name, startCoords, endCoords, color) {
	const panel = document.createElement('div');
	panel.className = 'panel';
	panel.id = `vector-${id}-panel`;
	panel.innerHTML = `
		<h3 style="color: ${color};">Вектор ${name}</h3>
		<div class="vector-input-group">
			<span>Начало:</span>
			<input type="number" id="${id}-start-x" placeholder="x" value="${startCoords.x}">
			<input type="number" id="${id}-start-y" placeholder="y" value="${startCoords.y}">
			<input type="number" id="${id}-start-z" placeholder="z" value="${startCoords.z}">
		</div>
		<div class="vector-input-group">
			<span>Конец:</span>
			<input type="number" id="${id}-end-x" placeholder="x" value="${endCoords.x}">
			<input type="number" id="${id}-end-y" placeholder="y" value="${endCoords.y}">
			<input type="number" id="${id}-end-z" placeholder="z" value="${endCoords.z}">
		</div>
	`;
	return panel;
}

// Добавления новой панели вектора
function addVectorPanel(start = {x:0, y:0, z:0}, end = {x:1, y:1, z:1}) {
	const vectorId = String.fromCharCode(97 + vectorCount); // a, b, c...
	const vectorName = vectorId.toUpperCase();
	const color = colors[vectorCount % colors.length];
	const panel = createVectorPanel(vectorId, vectorName, start, end, color);
	vectorInputsContainer.appendChild(panel);
	vectorCount++;
}

// Чтения координат всех векторов из UI
function getAllVectorsFromUI() {
	const vectors = [];
	for (let i = 0; i < vectorCount; i++) {
		const prefix = String.fromCharCode(97 + i);
		const start = new THREE.Vector3(
			parseFloat(document.getElementById(`${prefix}-start-x`).value),
			parseFloat(document.getElementById(`${prefix}-start-y`).value),
			parseFloat(document.getElementById(`${prefix}-start-z`).value)
		);
		const end = new THREE.Vector3(
			parseFloat(document.getElementById(`${prefix}-end-x`).value),
			parseFloat(document.getElementById(`${prefix}-end-y`).value),
			parseFloat(document.getElementById(`${prefix}-end-z`).value)
		);
		vectors.push({start, vector: new THREE.Vector3().subVectors(end, start)});
	}
	return vectors;
}

// --- LocalStorage ---
function saveVectorsToLocalStorage() {
	const vectorsData = [];
	for (let i = 0; i < vectorCount; i++) {
		const prefix = String.fromCharCode(97 + i);
		const start = {
			x: document.getElementById(`${prefix}-start-x`).value,
			y: document.getElementById(`${prefix}-start-y`).value,
			z: document.getElementById(`${prefix}-start-z`).value
		};
		const end = {
			x: document.getElementById(`${prefix}-end-x`).value,
			y: document.getElementById(`${prefix}-end-y`).value,
			z: document.getElementById(`${prefix}-end-z`).value
		};
		vectorsData.push({ start, end });
	}
	localStorage.setItem('vectorAppData', JSON.stringify(vectorsData));
}

// Отрисовки вектора
function drawVector(origin, vector, color) {
	if (vector.length() === 0) return;
	const arrow = new THREE.ArrowHelper(vector.clone().normalize(), origin, vector.length(), color);
	scene.add(arrow);
	drawnObjects.push(arrow);
}

// Добавление вектора
document.getElementById('add-vector-btn').addEventListener('click', () => {
	let startCoords = { x: 0, y: 0, z: 0 };

	if (vectorCount > 0) {
		const lastVectorPrefix = String.fromCharCode(97 + vectorCount - 1);
		startCoords = {
			x: parseFloat(document.getElementById(`${lastVectorPrefix}-end-x`).value),
			y: parseFloat(document.getElementById(`${lastVectorPrefix}-end-y`).value),
			z: parseFloat(document.getElementById(`${lastVectorPrefix}-end-z`).value)
		};
	}

	const endCoords = { x: startCoords.x + 1, y: startCoords.y + 1, z: startCoords.z + 1 };

	addVectorPanel(startCoords, endCoords);
	drawBtn.click();
	saveVectorsToLocalStorage();
});

// Удаление последнего вектора
document.getElementById('remove-last-vector-btn').addEventListener('click', () => {
	if (vectorCount > 0) {
		const lastVectorId = String.fromCharCode(97 + vectorCount - 1);
		const panelToRemove = document.getElementById(`vector-${lastVectorId}-panel`);
		if (panelToRemove) {
			vectorInputsContainer.removeChild(panelToRemove);
		}
		vectorCount--;
		drawBtn.click();
		saveVectorsToLocalStorage();
	}
});

// Отображение векторов
drawBtn.addEventListener('click', () => {
	clearScene();
	const allVectors = getAllVectorsFromUI();

	allVectors.forEach((vecData, index) => {
		const color = colors[index % colors.length];
		drawVector(vecData.start, vecData.vector, color);
	});
	
	resultText.textContent = `Отображено векторов: ${allVectors.length}.`;
	saveVectorsToLocalStorage();
});

// Кнопки операций
document.getElementById('operations-panel').addEventListener('click', (e) => {
	if (e.target.tagName !== 'BUTTON') return;

	const operation = e.target.dataset.op;
	if (!operation) return;

	drawBtn.click();

	const allVectors = getAllVectorsFromUI().map(v => v.vector);
	if (allVectors.length === 0) {
		resultText.textContent = 'Недостаточно векторов для операции.';
		return;
	}
	if (allVectors.length < 2 && ['dot', 'angle', 'cross'].includes(operation)) {
		resultText.textContent = 'Для этой операции нужно минимум 2 вектора.';
		return;
	}
	if (allVectors.length < 3 && operation === 'mixed') {
		resultText.textContent = 'Для смешанного произведения нужно минимум 3 вектора.';
		return;
	}

	let resultVector, resultScalar;

	const [vecA, vecB, vecC] = allVectors;

	switch (operation) {
		case 'add-all':
			resultVector = new THREE.Vector3();
			allVectors.forEach(v => resultVector.add(v));
			break;
		case 'sub-all':
			resultVector = vecA.clone();
			allVectors.slice(1).forEach(v => resultVector.sub(v));
			break;
		case 'dot':
			resultScalar = vecA.dot(vecB);
			break;
		case 'angle':
			resultScalar = vecA.angleTo(vecB) * 180 / Math.PI;
			break;
		case 'cross':
			resultVector = new THREE.Vector3().crossVectors(vecA, vecB);
			break;
		case 'mixed':
			resultScalar = vecA.dot(new THREE.Vector3().crossVectors(vecB, vecC));
			break;
	}

	if (resultVector) {
		drawVector(new THREE.Vector3(0, 0, 0), resultVector, '#ff00ff');
		resultText.innerHTML = `
			Результат:<br>
			x: ${resultVector.x.toFixed(3)}<br>
			y: ${resultVector.y.toFixed(3)}<br>
			z: ${resultVector.z.toFixed(3)}
		`;
	}

	if (resultScalar !== undefined) {
		if (operation === 'angle') {
			resultText.textContent = `Угол между A и B: ${resultScalar.toFixed(2)}°`;
		} else {
			resultText.textContent = `Результат: ${resultScalar.toFixed(3)}`;
		}
	}
});

// Возврат камеры в исходное положение
document.getElementById('reset-btn').addEventListener('click', () => {
	controls.reset();
	camera.position.set(startPosCam.x, startPosCam.y, startPosCam.z);
});

function initializeVectors() {
	const savedVectors = localStorage.getItem('vectorAppData');
	if (savedVectors) {
		const vectorsData = JSON.parse(savedVectors);
		if (vectorsData.length > 0) {
			vectorsData.forEach(data => addVectorPanel(data.start, data.end));
		}
	} else {
		addVectorPanel({x:0, y:0, z:0}, {x:2, y:3, z:3});
		addVectorPanel({x:2, y:3, z:3}, {x:4, y:-1, z:1});
	}
	drawBtn.click();
}

initializeVectors();