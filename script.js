const newPostBtn = document.getElementById("newPostBtn");
const resetBtn = document.getElementById("resetBtn");
const createPost = document.getElementById("createPost");
const savePost = document.getElementById("savePost");
const postsSection = document.getElementById("posts");

let posts = JSON.parse(localStorage.getItem("posts")) || [];

function renderPosts() {
    postsSection.innerHTML = "";
    posts.forEach((post, index) => {
        const div = document.createElement("div");
        div.classList.add("post");

        div.innerHTML = `
            <h2>${post.title}</h2>
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

    if (!title || !content) {
        alert("Preencha tudo!");
        return;
    }

    posts.push({ title, content });
    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    createPost.classList.add("hidden");
    renderPosts();
};

renderPosts();
