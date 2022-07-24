// faq1 script
import React, { useState, useEffect } from "react";
import "./App.css";
import { API, Storage } from "aws-amplify";
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";
// import { withAuthenticator } from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import "@aws-amplify/ui-react/styles.css";

const initialFormState = {
  name: "",
  description: "",
  slug: "",
  category: "",
  tags: "",
  bullet1: "",
  bullet2: "",
  bullet3: "",
};

function App({ signOut }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function onChange(e) {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const image = await Storage.get(note.image);
          note.image = image;
        }
        return note;
      })
    );
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  async function editNote({ id }) {}

  return (
    <div className="App">
      <Button onClick={signOut}>Sign Out</Button>
      <h1>YPD faq input form</h1>
      <input
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Title"
        value={formData.name}
      />
      <p></p>
      <span>Slug: </span>
      <input
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        placeholder="Slug"
        value={formData.slug}
      />
      <p></p>
      <span>Category: </span>
      <input
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Category"
        value={formData.category}
      />
      <p></p>
      <span>Tags: </span>
      <input
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        placeholder="Tags"
        value={formData.tags}
      />
      <p></p>
      <textarea
        // <textarea
        rows={10}
        cols={50}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Body text"
        value={formData.description}
      />
      <p></p>
      <span>Bullet 1: </span>
      <input
        onChange={(e) => setFormData({ ...formData, bullet1: e.target.value })}
        placeholder="Bullet 1"
        value={formData.bullet1}
      />
      <p></p>
      <span>Bullet 2: </span>
      <input
        onChange={(e) => setFormData({ ...formData, bullet2: e.target.value })}
        placeholder="Bullet 2"
        value={formData.bullet2}
      />
      <p></p>
      <span>Bullet 3: </span>
      <input
        onChange={(e) => setFormData({ ...formData, bullet3: e.target.value })}
        placeholder="Bullet 3"
        value={formData.bullet3}
      />
      <p></p>
      <span>Media: </span>
      <input type="file" onChange={onChange} />
      <p></p>
      <button onClick={createNote}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <p>= = = = = = = = = = = = = </p>
            <h2>{note.name}</h2>
            <p>Slug: {note.slug}</p>
            <p>Category: {note.category}</p>
            <p>Tags: {note.tags}</p>
            <p>
              <textarea rows={10} cols={50}>
                {note.description}
              </textarea>
            </p>
            <p>Bullet 1: {note.bullet1}</p>
            <p>Bullet 2: {note.bullet2}</p>
            <p>Bullet 3: {note.bullet3}</p>
            {note.image && <img src={note.image} style={{ width: 400 }} />}
            <p></p>
            <button onClick={() => editNote(note)}>Edit note</button>
            <button onClick={() => deleteNote(note)}>Delete note</button>
          </div>
        ))}
      </div>
      <withAuthenticator />
    </div>
  );
}

export default withAuthenticator(App);
