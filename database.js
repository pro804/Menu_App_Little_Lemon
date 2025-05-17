import * as SQLite from 'expo-sqlite';
import { SECTION_LIST_MOCK_DATA } from './utils';



const db = SQLite.openDatabaseAsync('little_lemon');

// Create the menuitems table
export async function createTable() {
  try {
    await (await db).execAsync(`
      PRAGMA journal_mode = WAL;
      create table if not exists menuitems (
        uuid text primary key not null,
        title text not null,
        price text not null,
        category text not null
      );
    `);
  } catch (error) {
    throw error;
  }
}
 
// Retrieve all menu items

export async function getMenuItems() {
  const statement = await (await db).prepareAsync('SELECT * FROM menuitems');
  const menuItems = await statement.executeAsync();
  await statement.finalizeAsync();
  return menuItems;
}

// Save all menu items
export async function saveMenuItems(menuItems) {
  const dbInstance = await db;
  const isInTransaction = await dbInstance.isInTransactionAsync();
  if (!isInTransaction) {
    await dbInstance.execAsync('BEGIN TRANSACTION');
  }
  try {
    const sql = 'INSERT OR REPLACE INTO menuitems (uuid, title, price, category) VALUES (?, ?, ?, ?)';
    for (const item of menuItems) {
      await dbInstance.runAsync(sql, [
        item.id || item.uuid,
        item.title,
        item.price,
        item.category,
      ]);
    }
    await dbInstance.execAsync('COMMIT');
  } catch (error) {
    await dbInstance.execAsync('ROLLBACK');
    console.error('Error saving menu items:', error);
  }
}


    // 2. Implement a single SQL statement to save all menu data in a table called menuitems.
    // Check the createTable() function above to see all the different columns the table has
    // Hint: You need a SQL statement to insert multiple rows at once.

/**
 * 4. Implement a transaction that executes a SQL statement to filter the menu by 2 criteria:
 * a query string and a list of categories.
 *
 * The query string should be matched against the menu item titles to see if it's a substring.
 * For example, if there are 4 items in the database with titles: 'pizza, 'pasta', 'french fries' and 'salad'
 * the query 'a' should return 'pizza' 'pasta' and 'salad', but not 'french fries'
 * since the latter does not contain any 'a' substring anywhere in the sequence of characters.
 *
 * The activeCategories parameter represents an array of selected 'categories' from the filter component
 * All results should belong to an active category to be retrieved.
 * For instance, if 'pizza' and 'pasta' belong to the 'Main Dishes' category and 'french fries' and 'salad' to the 'Sides' category,
 * a value of ['Main Dishes'] for active categories should return  only'pizza' and 'pasta'
 *
 * Finally, the SQL statement must support filtering by both criteria at the same time.
 * That means if the query is 'a' and the active category 'Main Dishes', the SQL statement should return only 'pizza' and 'pasta'
 * 'french fries' is excluded because it's part of a different category and 'salad' is excluded due to the same reason,
 * even though the query 'a' it's a substring of 'salad', so the combination of the two filters should be linked with the AND keyword
 *
 */


// 4. Implement the filterByQueryAndCategories function
export async function filterByQueryAndCategories(query, activeCategories) {
  console.log('Filtering menu items with query:', query);
  console.log('Active categories:', activeCategories);

  try {
    // Retrieve all menu items
    const allMenuItemsStatement = await (await db).prepareAsync('SELECT * FROM menuitems');
    const allMenuItemsResult = await allMenuItemsStatement.executeAsync();
    const allMenuItems = await allMenuItemsResult.getAllAsync();
    console.log('All menu items:', allMenuItems);

    // Filter menu items by category and query
    const placeholders = activeCategories.map(() => '?').join(',');
    const sql = `
      SELECT * FROM menuitems
      WHERE LOWER(title) LIKE ?
      AND LOWER(category) IN (${placeholders})
    `;
    const params = [
      `%${query.toLowerCase()}%`,
      ...activeCategories.map((category) => category.toLowerCase()),
    ];

    console.log('SQL query:', sql);
    console.log('Params:', params);

    const statement = await (await db).prepareAsync(sql);
    try {
      const result = await statement.executeAsync(params);
      console.log('Result:', result);

      if (result.changes === 0) {
        console.log('No menu items found matching the categories and query.');
      } else {
        const menuItems = await result.getAllAsync();
        console.log('Menu items:', menuItems);
        return menuItems;
      }
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error filtering menu items:', error);
    throw error;
  }
} 
