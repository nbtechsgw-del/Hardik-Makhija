let members = [];

function addMember() {
    let name = document.getElementById("name").value;
    let relation = document.getElementById("relation").value;
    let parent = document.getElementById("parent").value;

    if (name === "" || relation === "") {
        alert("Please fill all required fields");
        return;
    }

    let member = {
        name: name,
        relation: relation,
        parent: parent
    };

    members.push(member);
    displayMembers();

    document.getElementById("name").value = "";
    document.getElementById("relation").value = "";
    document.getElementById("parent").value = "";
}

function displayMembers() {
    let list = document.getElementById("memberList");
    list.innerHTML = "";

    members.forEach((m, index) => {
        let symbol = m.parent ? "└── " : "👤 ";
        list.innerHTML += `
            <li class="tree-card">
                ${symbol}<b>${m.name}</b> (${m.relation})<br>
                Parent: ${m.parent || "None"} <br><br>
                <button onclick="deleteMember(${index})">Delete</button>
            </li>
        `;
    });
}


function deleteMember(index) {
    members.splice(index, 1);
    displayMembers();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

function searchMember() {
    let input = document.getElementById("search").value.toLowerCase();
    let items = document.querySelectorAll("#memberList li");

    items.forEach(item => {
        if (item.innerText.toLowerCase().includes(input)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}