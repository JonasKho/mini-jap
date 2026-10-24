import {integer,sqliteTable,text,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const complaints=sqliteTable('complaints',{
 id:text('id').primaryKey(),accountKey:text('account_key').notNull(),customer:text('customer').notNull().default(''),orderNumber:text('order_number').notNull().default(''),product:text('product').notNull().default(''),status:text('status').notNull().default('draft'),payload:text('payload').notNull(),version:integer('version').notNull().default(1),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
},t=>[index('complaints_account_updated').on(t.accountKey,t.updatedAt)]);
export const accountSettings=sqliteTable('account_settings',{accountKey:text('account_key').primaryKey(),payload:text('payload').notNull(),version:integer('version').notNull().default(1),updatedAt:text('updated_at').notNull()});
export const aiUsage=sqliteTable('ai_usage',{accountKey:text('account_key').notNull(),bucket:integer('bucket').notNull(),count:integer('count').notNull().default(0)},t=>[primaryKey({columns:[t.accountKey,t.bucket]})]);
