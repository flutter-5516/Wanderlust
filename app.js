const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
//for common propeeties
const ejsMate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync.js");
const ExpressError=require("./util/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.set("layout", "layouts/boilerplate");

async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

//All listings
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

app.get("/", (req, res) => {
  res.send("its home");
});

//new listings
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show  route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Create route
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    const listing = req.body;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body);
  res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});



// Error-handling middleware
app.use((err, req, res, next) => {
  res.send("something is wrong");
});

// // Catch-all 404 route
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not found"));
// });

// 404
app.use((req, res) => {
  res.status(404).send("Page not found!");
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My Home",
//     description: "By the Beach",
//     price: 1200,
//     location: "Goa",
//     country: "India",
//   });
//   await sampleListing
//     .save()
//     .then((res) => {
//       console.log("Listing was saved");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//     res.send("successful");
// });
