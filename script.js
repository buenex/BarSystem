const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const modal = document.getElementById("modal");
const comandaList = document.getElementById("comandaList");
let shapes = getTables();
let selectedShape = null;
let listOfTables = [];
let isMoving = false;

canvas.addEventListener("click", (e) => {
    const { offsetX, offsetY } = e;
    selectedShape = shapes.find(shape => 
        ctx.isPointInPath(shape.path, offsetX, offsetY)
    );
    if (selectedShape && !isMoving) openModal(selectedShape);
    isMoving = false; 
});

function addShape(type) {
    const shape = {
        type,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 50,
        label: prompt("Digite o nome (ou numero) desse item:"),
        path: new Path2D(),
        order:{
            id:0,
            leadCustomer: "",
            items:[]
        }
    };
    shapes.push(shape);
    drawShapes();
    saveTables()
}

function drawShapes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        shape.path = new Path2D();
        if (shape.type === 'circle') {
            shape.path.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'lightblue';
        } else {
            shape.path.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
            ctx.fillStyle = 'lightgreen';
        }
        ctx.fill(shape.path);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(shape.label, shape.x - shape.label.length*3, shape.y + 5);
    });
}

function openModal(shape) {
    if(shape.type == "circle"){
        modal.style.display = "block"; 
        if(shape.order.id == 0){
            shape.order.id = Date.now();
            shape.order.leadCustomer = prompt("Digite o nome do responsavel pela comanda:");
        }
        drawModal(); 
    }
}

function closeModal() {
    modal.style.display = "none";
}

function addToComanda() {
    const item = document.getElementById("item").value;
    if (item) {
        selectedShape.order.items.push(item);
        document.getElementById("item").value = "";
    }
    saveTables()
    drawModal()
}

canvas.addEventListener("mousedown", (e) => {
    const { offsetX, offsetY } = e;
    selectedShape = shapes.findLast(shape => 
        ctx.isPointInPath(shape.path, offsetX, offsetY)
    );

    if (selectedShape) {
        isMoving = false; 
        canvas.addEventListener("mousemove", moveShape);
        canvas.addEventListener("mouseup", () => {
            canvas.removeEventListener("mousemove", moveShape);
            if (!isMoving && selectedShape) {
                openModal(selectedShape);
            }
        }, { once: true });
    }
});

function moveShape(e) {
    const { offsetX, offsetY } = e;
    selectedShape.x = offsetX;
    selectedShape.y = offsetY;
    isMoving = true; 
    saveTables()
    drawShapes();
}

function drawModal(){
    comandaList.innerHTML = "";
    let tableName = document.getElementById("table-name");
    let orderId = document.getElementById("order-id");
    let customerName = document.getElementById("customer-name");
    selectedShape.order.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        comandaList.appendChild(li);
    })
    orderId.innerHTML =`Comanda: ${selectedShape.order.id}`
    customerName.innerHTML =`Nome: ${selectedShape.order.leadCustomer}`
    tableName.innerHTML =`Mesa: ${selectedShape.label}`
}

function getTables(){
    let tables = JSON.parse(localStorage.getItem("tables"));
    return tables ? tables : [];
}

function saveTables(){
    localStorage.setItem("tables", JSON.stringify(shapes));
}

drawShapes();
