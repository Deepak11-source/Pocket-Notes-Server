const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 5000;
require("dotenv").config();


app.use(cors());
app.use(express.json());



const connectDb = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); 
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`; // Properly format the string using backticks
};


const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: {
    type: String, 
    required: true,
    default: () => formatDate(new Date()),
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Note = mongoose.model("Note", NoteSchema);


const NoteGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  },
  {
    versionKey: false,
  }
);
const NoteGroup = mongoose.model("NoteGroup", NoteGroupSchema);

app.post("/note-groups", async (req, res) => {
  try {
    const newGroup = new NoteGroup(req.body);
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/note-groups", async (req, res) => {
  try {
    const groups = await NoteGroup.find().populate("notes");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/note-groups/:groupId",async(req,res)=>{
  const id=req.params.groupId
  console.log("Here",id)
  const groups = await NoteGroup.findById(id).populate("notes");
  console.log(groups)
  res.status(200).json(groups.notes)
})

app.post("/note-groups/:id/notes", async (req, res) => {
  try {
    const { newNotes } = req.body;
    console.log(newNotes.id);
    const id=newNotes.id
    const content=newNotes.content
    const newNote = new Note({
      content,
      id,
    });
    const savedNote = await newNote.save();
    const noteGroup = await NoteGroup.findById(req.params.id);
    if (!noteGroup) {
      return res.status(404).json({ error: "NoteGroup not found" });
    }
    noteGroup.notes.push(savedNote._id);
    await noteGroup.save();
    // console.log(noteGroup)
    

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/note-groups/:id/notes", async (req, res) => {
  try {
    const noteGroup = await NoteGroup.findById(req.params.id).populate("notes");
    if (!noteGroup) {
      return res.status(404).json({ error: "NoteGroup not found" });
    }
    res.status(200).json(noteGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/note-text", async (req, res) => {
  const note = new Note({
    content,
    createdBy,
  });
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});