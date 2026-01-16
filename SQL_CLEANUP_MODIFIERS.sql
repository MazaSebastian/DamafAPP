-- Clean up redundant "Sin ..." modifiers from the database
-- Since we now handle removals via the 'removable_ingredients' text array,
-- these old modifiers are no longer needed and clutter the Extras list.

DELETE FROM modifiers 
WHERE name ILIKE 'Sin %' 
AND price = 0;
