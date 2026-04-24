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
        list.innerHTML += `
            <li>
                <b>${m.name}</b> (${m.relation})<br>
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