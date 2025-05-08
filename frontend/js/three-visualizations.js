import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class ExpenseVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    setupScene() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }
    
    createExpensePieChart(expenseData) {
        // Clear existing chart
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        const radius = 2;
        const depth = 0.3;
        let startAngle = 0;
        const totalExpense = Object.values(expenseData).reduce((a, b) => a + b, 0);
        
        Object.entries(expenseData).forEach(([category, amount]) => {
            const angle = (amount / totalExpense) * Math.PI * 2;
            const geometry = new THREE.CylinderGeometry(radius, radius, depth, 32, 1, false, startAngle, angle);
            
            // Generate a unique color for each category
            const color = new THREE.Color(Math.random() * 0xffffff);
            const material = new THREE.MeshPhongMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8
            });
            
            const slice = new THREE.Mesh(geometry, material);
            slice.userData = { category, amount }; // Store data for interactivity
            
            this.scene.add(slice);
            startAngle += angle;
        });
        
        // Add lights back
        this.setupLights();
    }
    
    createExpenseBarChart(expenseData) {
        // Clear existing chart
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        const maxAmount = Math.max(...Object.values(expenseData));
        const spacing = 1;
        let xPosition = -(Object.keys(expenseData).length * spacing) / 2;
        
        Object.entries(expenseData).forEach(([category, amount]) => {
            const height = (amount / maxAmount) * 4; // Scale height to maximum of 4 units
            const geometry = new THREE.BoxGeometry(0.5, height, 0.5);
            const material = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color(Math.random() * 0xffffff),
                transparent: true,
                opacity: 0.8
            });
            
            const bar = new THREE.Mesh(geometry, material);
            bar.position.set(xPosition, height/2, 0);
            bar.userData = { category, amount }; // Store data for interactivity
            
            this.scene.add(bar);
            xPosition += spacing;
        });
        
        // Add lights back
        this.setupLights();
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export default ExpenseVisualizer; 