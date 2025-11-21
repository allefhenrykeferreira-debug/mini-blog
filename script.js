const newPostBtn = document.getElementById("newPostBtn");
const resetBtn = document.getElementById("resetBtn");
const savePostBtn = document.getElementById("savePost");

const createPostSection = document.getElementById("createPost");
const postsContainer = document.getElementById("posts");

function loadPosts() {
    postsContainer.innerHTML = "";
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
        postsContainer.appendChild(div);
    });
}

newPostBtn.onclick = () => {
    createPostSection.classList.toggle("hidden");
};

savePostBtn.onclick = () => {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    if (!title || !content) {
        alert("Preencha tudo, pô 😂");
        return;
    }

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts.push({ title, content });

    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";

    createPostSection.classList.add("hidden");

    loadPosts();
};

resetBtn.onclick = () => {
    if (confirm("Tem certeza? Vai apagar tudo mesmo! 😳")) {
        localStorage.removeItem("posts");
        loadPosts();
    }
};

loadPosts();
