const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,  // Стандартний порт PostgreSQL
  ssl: { rejectUnauthorized: false }  // Для підключення до Render
});

client.connect()
  .then(() => console.log('✅ Підключено до PostgreSQL'))
  .catch(err => console.error('❌ Помилка підключення:', err));

module.exports = client;

const createTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS EuroSongs (
        song_id SERIAL PRIMARY KEY,
        song_name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL
      );
      INSERT INTO EuroSongs (song_name, author, country) VALUES 
      ('Zjerm', 'Shkodra Elektronike', 'Albania'),
      ('Survivor', 'Parg', 'Armenia'),
      ('Milkshake Man', 'Go-Jo', 'Australia'),
      ('Wasted Love', 'JJ', 'Austria'),
      ('Run with U', 'Mamagrama', 'Azerbaijan'),
      ('Strobe Lights', 'Red Sebastian', 'Belgium'),
      ('Poison Cake', 'Marko Bošnjak', 'Croatia'),
      ('Kiss Kiss Goodbye', 'Adonxs', 'Czechia'),
      ('Hallucination', 'Sissal', 'Denmark'),
      ('Espresso Macchiato', 'Tommy Cash', 'Estonia'),
      ('Ich komme', 'Erika Vikman', 'Finland'),
      ('Baller', 'Abor & Tynna', 'Germany'),
      ('Asteromata', 'Klavdia', 'Greece'),
      ('Róa', 'Væb', 'Iceland'),
      ('Laika Party', 'Emmy', 'Ireland'),
      ('New Day Will Rise', 'Yuval Raphael', 'Israel'),
      ('Volevo essere un duro', 'Lucio Corsi', 'Italy'),
      ('Bur man laimi', 'Tautumeitas', 'Latvia'),
      ('Tavo akys', 'Katarsis', 'Lithuania'),
      ('La poupée monte le son', 'Laura Thorn', 'Luxembourg'),
      ('Kant', 'Miriana Conte', 'Malta'),
      ('Dobrodošli', 'Nina Žižić', 'Montenegro'),
      ('C''est la vie', 'Claude', 'Netherlands'), 
      ('Lighter', 'Kyle Alessandro', 'Norway'),
      ('Gaja', 'Justyna Steczkowska', 'Poland'),
      ('Deslocado', 'Napa', 'Portugal'),
      ('Tutta l''Italia', 'Gabry Ponte', 'San Marino'), 
      ('Mila', 'Princ', 'Serbia'),
      ('How Much Time Do We Have Left', 'Klemen', 'Slovenia'),
      ('Esa diva', 'Melody', 'Spain'),
      ('Bara bada bastu', 'KAJ', 'Sweden'),
      ('Bird of Pray', 'Ziferblat', 'Ukraine'),
      ('What the Hell Just Happened?', 'Remember Monday', 'United Kingdom');


    `;

    try {
        await client.query(query);
        console.log("✅ Таблиця 'users' створена або вже існує.");
    } catch (err) {
        console.error("❌ Помилка при створенні таблиці:", err);
    }
};

createTable();