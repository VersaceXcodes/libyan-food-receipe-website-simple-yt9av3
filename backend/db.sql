-- Drop existing tables if they exist
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS recipe_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- Create table: recipe_categories
CREATE TABLE recipe_categories (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

-- Create table: recipes
CREATE TABLE recipes (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL,
  full_description text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text NOT NULL,
  ingredients json NOT NULL,
  instructions json NOT NULL,
  cooking_time_minutes integer NOT NULL,
  prep_time_minutes integer NOT NULL,
  serving_size text,
  difficulty text NOT NULL,
  category_id text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES recipe_categories(id)
);

-- Create table: users
CREATE TABLE users (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at text NOT NULL
);

-- Create table: contacts
CREATE TABLE contacts (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  submitted_at text NOT NULL
);

-- Create table: subscriptions
CREATE TABLE subscriptions (
  id text NOT NULL PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at text NOT NULL
);

-- Create table: site_settings
CREATE TABLE site_settings (
  id text NOT NULL PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL
);

--------------------------------------------------
-- Seed Data
--------------------------------------------------

-- Seed data for recipe_categories
INSERT INTO recipe_categories (id, name, description) VALUES
  ('category1', 'Appetizer', 'Light starters to begin your meal'),
  ('category2', 'Main Course', 'Hearty and fulfilling main course recipes'),
  ('category3', 'Dessert', 'Sweet treats to finish your meal beautifully');

-- Seed data for recipes
INSERT INTO recipes (
  id, title, slug, short_description, full_description,
  image_url, thumbnail_url, ingredients, instructions,
  cooking_time_minutes, prep_time_minutes, serving_size, difficulty,
  category_id, is_featured, created_at, updated_at
) VALUES
  (
    'recipe1',
    'Simple Tomato Salad',
    'simple-tomato-salad',
    'A refreshing and simple tomato salad with basil dressing.',
    'This easy tomato salad is a burst of flavor with fresh tomatoes, basil, and a light dressing. Perfect for a quick appetizer.',
    'https://picsum.photos/seed/recipe1/600/400',
    'https://picsum.photos/seed/recipe1_thumb/300/200',
    '[{"name": "Tomatoes", "measurement": "3 medium"}, {"name": "Basil", "measurement": "a handful"}, {"name": "Olive Oil", "measurement": "2 tbsp"}]',
    '[{"step_number": 1, "instruction": "Slice the tomatoes."}, {"step_number": 2, "instruction": "Chop basil and mix with tomatoes."}, {"step_number": 3, "instruction": "Drizzle with olive oil and serve."}]',
    0,
    10,
    '2 servings',
    'Easy',
    'category1',
    true,
    '2023-10-01 10:00:00',
    '2023-10-01 10:00:00'
  ),
  (
    'recipe2',
    'Libyan Couscous with Lamb',
    'libyan-couscous-with-lamb',
    'A traditional Libyan dish featuring tender lamb and fluffy couscous.',
    'This Libyan Couscous with Lamb is a hearty and flavorful dish that combines tender pieces of lamb with savory spices and perfectly steamed couscous.',
    'https://picsum.photos/seed/recipe2/600/400',
    'https://picsum.photos/seed/recipe2_thumb/300/200',
    '[{"name": "Lamb", "measurement": "500g"}, {"name": "Couscous", "measurement": "300g"}, {"name": "Spices", "measurement": "assorted"}]',
    '[{"step_number": 1, "instruction": "Marinate the lamb with spices."}, {"step_number": 2, "instruction": "Cook the lamb until tender."}, {"step_number": 3, "instruction": "Steam the couscous and mix with lamb."}]',
    90,
    20,
    '4 servings',
    'Medium',
    'category2',
    false,
    '2023-10-02 12:00:00',
    '2023-10-02 12:00:00'
  ),
  (
    'recipe3',
    'Honey Almond Baklava',
    'honey-almond-baklava',
    'A sweet and nutty dessert that melts in your mouth.',
    'Honey Almond Baklava is a delectable dessert layered with flaky pastry, crunchy almonds, and a rich honey syrup. A taste of Middle Eastern indulgence.',
    'https://picsum.photos/seed/recipe3/600/400',
    'https://picsum.photos/seed/recipe3_thumb/300/200',
    '[{"name": "Phyllo Dough", "measurement": "1 package"}, {"name": "Almonds", "measurement": "200g"}, {"name": "Honey", "measurement": "100ml"}]',
    '[{"step_number": 1, "instruction": "Layer the phyllo dough and almonds."}, {"step_number": 2, "instruction": "Bake until crispy."}, {"step_number": 3, "instruction": "Drizzle with honey syrup and serve warm."}]',
    45,
    30,
    '6 servings',
    'Medium',
    'category3',
    true,
    '2023-10-03 14:00:00',
    '2023-10-03 14:30:00'
  );

-- Seed data for users
INSERT INTO users (id, name, email, password_hash, is_admin, created_at) VALUES
  ('user1', 'Admin User', 'admin@example.com', 'hash_admin', true, '2023-10-01 09:00:00'),
  ('user2', 'Regular User', 'user@example.com', 'hash_user', false, '2023-10-01 09:30:00');

-- Seed data for contacts
INSERT INTO contacts (id, name, email, message, submitted_at) VALUES
  ('contact1', 'John Doe', 'john.doe@example.com', 'I love the recipes and the website design!', '2023-10-02 09:00:00'),
  ('contact2', 'Jane Smith', 'jane.smith@example.com', 'Could you please add more dessert recipes?', '2023-10-02 11:30:00');

-- Seed data for subscriptions
INSERT INTO subscriptions (id, email, subscribed_at) VALUES
  ('sub1', 'subscriber1@example.com', '2023-10-01 15:00:00'),
  ('sub2', 'subscriber2@example.com', '2023-10-03 08:00:00');

-- Seed data for site_settings
INSERT INTO site_settings (id, key, value) VALUES
  ('setting1', 'site_title', 'Libyan Food Recipes'),
  ('setting2', 'tagline', 'Explore the rich culinary traditions of Libya');