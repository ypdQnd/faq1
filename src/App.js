import logo from "./logo.svg";

import React, { useState, useEffect } from "react";
import "./App.css";
import { API, Storage } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import "@aws-amplify/ui-react/styles.css";

const initialFormState = { name: "", description: "" };

function App() {
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

  return (
    <div className="App">
      <h1>My Notes App</h1>
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
      <span>Media: </span>
      <input type="file" onChange={onChange} />
      <p></p>
      <button onClick={createNote}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <p>= = = = = = = = = = = = = </p>
            <h2>{note.name}</h2>
            <p>{note.slug}</p>
            <p>{note.category}</p>
            <p>
              <textarea rows={10} cols={50}>
                {note.description}
              </textarea>
            </p>
            {note.image && <img src={note.image} style={{ width: 400 }} />}
            <p></p>
            <button onClick={() => deleteNote(note)}>Delete note</button>
          </div>
        ))}
      </div>
      <withAuthenticator />
    </div>
  );
}

export default withAuthenticator(App);
