CREATE TABLE categories
(
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    icon        VARCHAR(50),
    description VARCHAR(500)
);

-- Seed default categories
INSERT INTO categories (name, icon, description)
VALUES ('Tools', 'build', 'Drills, saws, wrenches, and other hardware tools'),
       ('Electronics', 'devices', 'Cameras, projectors, speakers, and gadgets'),
       ('Outdoor & Camping', 'nature', 'Tents, sleeping bags, coolers, camping gear'),
       ('Sports & Fitness', 'sports', 'Balls, rackets, yoga mats, exercise equipment'),
       ('Kitchen & Dining', 'restaurant', 'Mixers, grills, bakeware, large cookware'),
       ('Gardening', 'yard', 'Mowers, trimmers, shovels, garden tools'),
       ('Books & Media', 'book', 'Books, DVDs, board games, educational materials'),
       ('Party & Events', 'celebration', 'Tables, chairs, decorations, sound systems'),
       ('Vehicles', 'directions_car', 'Bikes, scooters, trailers, carts'),
       ('Other', 'category', 'Items that do not fit other categories');
