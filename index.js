const express = require("express");
const ejs = require('ejs');
const path = require('path'); // native node module
const multer  = require('multer');
const _ = require('lodash');

const port = 3000;
const date = require(__dirname + "/script/date.js");
const blog = require(__dirname + "/script/blog-content.js");
const author = require(__dirname + "/script/authors.js");

// **************** Upload Image (start) ****************
// 4) Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        // ***** Solution 1 | input name and date
        // cb(null, file.fieldname + '_' +  Date.now() + path.extname(file.originalname));

        // ***** Solution 2 | file name and date
        let temp_file_arr = file.originalname.split(".");
        let temp_file_name = temp_file_arr[0];
        let temp_file_ext = temp_file_arr[1];
        cb(null, temp_file_name + '_' +  Date.now() + '.' + temp_file_ext);
    }
});
// 5) Init Upload
const upload = multer({ storage: storage }).single('postImage');
// **************** Upload Image (end) ****************


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const homeStartContent = {
    title: "Hi, welcome to Blaze!",
    content: "Your blog is empty at the moment. Share your unique, memorable experience today and immediately get 100 free flare points that you can accumulate and award to your favorite blog authors. Let's get blogging!"
};

let blogName = "My Blog";
const authors = author.getAuthors();
const blogposts = blog.getBlogposts();
const userposts = [];
// const combinedPosts = Array.prototype.push.apply(blogposts,userposts);
// var combinedPosts = [...blogposts, ...userposts];

// --------------- Home ---------------
app.get("/", (req, res) => {

    res.render("home", { 
        userposts: userposts,
        homeContent: homeStartContent, 
        blogposts: blogposts, 
        author: authors, 
    });

});

app.post("/", (req, res) => {

});

// --------------- Latest Blogs ---------------
app.get("/latest-blogs", (req, res) => {

    res.render("blogs", { 
        userposts: userposts,
        blogposts: blogposts, 
        homeContent: homeStartContent, 
    });

});

// --------------- Authors ---------------
app.get("/favorite-authors", (req, res) => {

    res.render("authors", {
        userposts: userposts,
        author: authors, 
    });

});

// --------------- My Blog ---------------
app.get("/myblog", (req, res) => {

    console.log(userposts);

    res.render("myblog", { 
        userposts: userposts,
        blogName: blogName, 
        homeContent: homeStartContent, 
    });

});

// --------------- My Blog : Post ---------------
app.get("/myblog/:postTitle", (req, res) => {
    // res.send(req.params.postTitle)
    // res.send(req.params)
    
    const requestedPostTitle = _.lowerCase(req.params.postTitle);

    userposts.forEach(post => {

        const existingPostTitle = _.lowerCase(post.title);

        if (requestedPostTitle === existingPostTitle) {
            // console.log("Match Found!");
            // res.send("Match Found!");
            res.render("mypost", { 
                userposts: userposts,
                title: post.title,
                content: post.content,
                image: post.image,
                author: post.author,
                authorLink: post.authorLink,
                dateTime: post.autdateTimehor,
                id: post.id
            });
        } 
        // else {
        //     res.render("404", { 
        //         userposts: userposts,
        //     });
        // }
        
    });


  })

// --------------- New Blog ---------------
app.get("/new-blog", (req, res) => {

    res.render("new-blog", { 
        userposts: userposts,
        blogName: blogName, 
    });

});

app.post("/new-blog", (req, res) => {

    let newBlogName = req.body.blogName;

    if (newBlogName == "My Blog") {
        // blogName.push(newBlogName);
        blogName = newBlogName;
        res.redirect("/myblog");
    }

    // ********** Node.js Image Upload Script **********
    upload(req, res, (err) => {

        if (err) {

            console.log(err);
            // res.render('new-blog', {
            //     msg: err
            // });

        } else {

            let newBlogpost = {
                id: userposts.length + 1,
                title: req.body.blogpostTitle.toLowerCase(),
                overview: req.body.blogpostText.substring(0, 260),
                content: req.body.blogpostText,
                image: req.file.filename,
                author: req.body.blogpostAuthor,
                authorLink: req.body.authorContactLink,
                dateTime: date.getDate(),
            }

            userposts.push(newBlogpost);

            res.redirect("/myblog");
        }

    });

});

app.post("/new-blog-name", (req, res) => {

    let newBlogName = req.body.blogName;

    if (newBlogName == "My Blog") {
    } else {
        blogName = newBlogName;
    }

    res.redirect("/myblog");

});

// --------------- User Account ---------------
app.get("/user-account", (req, res) => {

    res.render("user-account", {         
        userposts: userposts
    });

});

// --------------- About ---------------
app.get("/about", (req, res) => {

    res.render("about", { 
        userposts: userposts
    });

});

// --------------- Contact ---------------
app.get("/contact", (req, res) => {

    res.render("contact", { 
        userposts: userposts,
    });

});


app.listen(port, () => {
    console.log(`Ablaze's server started on port http://localhost:${port}`);
});
