import { db } from "../db"

export async function getAllProducts() {
  const res = await db.query(
    "SELECT * FROM products WHERE is_active = true"
  )
  return res.rows;
}

export async function getProductBySlug(slug: string) {
  const res = await db.query(
    `
    SELECT * FROM products p
    WHERE p.slug = $1
    `,
    [slug]
  )
  return res.rows[0] || null
}

export async function getProductImages(productId: string) {
  const res = await db.query(
    `
      SELECT * FROM product_images
      WHERE product_id = $1
    `,
    [productId]
  )
  return res.rows
}

export async function getProductSlugById(id: string): Promise<string | null> {
  const res = await db.query(
    `SELECT slug FROM products WHERE id = $1`,
    [id]
  );
  return res.rows[0]?.slug || null;
}

export async function updateProduct(id: string, productData: any) {
  // Update product details
  await db.query(
    `
    UPDATE products
    SET
      name = $2,
      subtitle = $3,
      category = $4,
      fit_type = $5,
      tag = $6,
      "desc" = $7,
      primary_image = $8
    WHERE id = $1
    `,
    [
      id,
      productData.name,
      productData.subtitle,
      productData.category,
      productData.fitType,
      productData.tag,
      productData.description,
      productData.primaryImage,
    ]
  );

  // Get existing variants
  const existingVariants = await db.query(
    'SELECT * FROM product_variants WHERE product_id = $1',
    [id]
  );

  const existingMap: Record<string, string> = {};
  for (const v of existingVariants.rows) {
    const key = `${v.color_name}__${v.size.trim()}`;
    existingMap[key] = v.id;
  }

  const incomingKeys = new Set<string>();

  for (const color of productData.colors) {
    for (const size of productData.sizes) {
      const stock = productData.stock[color.name]?.[size] || 0;
      const key = `${color.name}__${size}`;
      incomingKeys.add(key);

      if (existingMap[key]) {
        // Update existing variant
        await db.query(
          `
          UPDATE product_variants
          SET stock = $2, price = $3, original_price = $4, color_hex = $5
          WHERE id = $1
          `,
          [existingMap[key], stock, productData.price, productData.originalPrice || null, color.hex]
        );
      } else {
        // Insert new variant
        await db.query(
          `
          INSERT INTO product_variants (product_id, color_name, color_hex, size, price, original_price, sku, stock)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [id, color.name, color.hex, size, productData.price, productData.originalPrice, `${productData.skuPrefix}-${color.name}-${size}`, stock]
        );
      }
    }
  }

  for (const [key, variantId] of Object.entries(existingMap)) {
    if (!incomingKeys.has(key)) {
      await db.query(
        `
        DELETE FROM product_variants
        WHERE id = $1
        AND NOT EXIST (
          SELECT 1 FROM order_items WHERE variant_id = $1
        )
        `,
        [variantId]
      );
    }
  }

}