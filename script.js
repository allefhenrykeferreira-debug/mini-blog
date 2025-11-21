const newPostBtn = document.getElementById("newPostBtn");
const resetBtn = document.getElementById("resetBtn");
const createPost = document.getElementById("createPost");
const savePost = document.getElementById("savePost");
const postsSection = document.getElementById("posts");

let posts = JSON.parse(localStorage.getItem("posts")) || [];

function renderPosts() {
    postsSection.innerHTML = "";
    posts.forEach((post) => {
        const div = document.createElement("div");
        div.classList.add("post");

        div.innerHTML = `
            <h2>${post.title}</h2>
            ${post.image ? `<img src="${post.image}" class="post-img">` : ""}
            <p>${post.content}</p>
        `;

        postsSection.appendChild(div);
    });
}

newPostBtn.onclick = () => {
    createPost.classList.toggle("hidden");
};

savePost.onclick = () => {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const image = document.getElementById("postImage").value;

    if (!title || !content) {
        alert("Preencha tudo!");
        return;
    }

    posts.push({ title, content, image });
    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    createPost.classList.add("hidden");
    renderPosts();
};

renderPosts();

resetBtn.onclick = () => {
    if (confirm("Tem certeza que quer apagar todos os posts?")) {
        localStorage.removeItem("posts");
        posts = [];
        renderPosts();
    }
};
