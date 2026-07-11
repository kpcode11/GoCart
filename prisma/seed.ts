import { PrismaClient, OrderStatus, PaymentMethod } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting comprehensive seed...')

  // 1. Wipe existing mock data to avoid unique constraint / FK errors
  console.log('Wiping old mock data...')
  await prisma.rating.deleteMany({ where: { userId: { startsWith: 'mock-' } } })
  await prisma.order.deleteMany({ where: { userId: { startsWith: 'mock-' } } })
  await prisma.coupon.deleteMany({ where: { code: { in: ['WELCOME10', 'SUMMER20'] } } })
  await prisma.address.deleteMany({ where: { userId: { startsWith: 'mock-' } } })
  await prisma.product.deleteMany({ where: { store: { userId: { startsWith: 'mock-' } } } })
  await prisma.store.deleteMany({ where: { userId: { startsWith: 'mock-' } } })
  await prisma.user.deleteMany({ where: { id: { startsWith: 'mock-' } } })

  console.log('Old mock data wiped.')

  // 2. Users
  const usersData = [
    { id: 'mock-seller-1', name: 'John Tech', email: 'john@techhaven.com', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', cart: {} },
    { id: 'mock-seller-2', name: 'Emma Components', email: 'emma@pccomponents.com', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', cart: {} },
    { id: 'mock-buyer-1', name: 'Alice Buyer', email: 'alice@example.com', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', cart: {} },
    { id: 'mock-buyer-2', name: 'Bob Buyer', email: 'bob@example.com', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', cart: {} }
  ]
  for (const u of usersData) await prisma.user.create({ data: u })
  console.log('Created Users.')

  // 3. Stores
  const storesData = [
    { id: 'mock-store-1', userId: 'mock-seller-1', name: 'Tech Haven', description: 'Best gadgets in town', username: 'tech-haven', address: '123 Silicon Blvd', status: 'approved', isActive: true, logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop', email: 'contact@techhaven.com', contact: '1234567890' },
    { id: 'mock-store-2', userId: 'mock-seller-2', name: 'PC Components Co.', description: 'Top tier PC parts and accessories', username: 'pc-components', address: '456 Tech Park', status: 'approved', isActive: true, logo: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=200&auto=format&fit=crop', email: 'contact@pccomponents.com', contact: '0987654321' }
  ]
  for (const s of storesData) await prisma.store.create({ data: s })
  console.log('Created Stores.')

  // 4. Products
  const productsData = [
    // Tech Haven (mock-store-1)
    { id: 'mock-prod-1', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse.', mrp: 49.99, price: 29.99, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=500&auto=format&fit=crop'], category: 'Electronics', storeId: 'mock-store-1' },
    { id: 'mock-prod-2', name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard.', mrp: 129.99, price: 99.99, images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=500&auto=format&fit=crop'], category: 'Electronics', storeId: 'mock-store-1' },
    { id: 'mock-prod-3', name: '4K Monitor', description: '27-inch 4K IPS monitor.', mrp: 399.99, price: 349.99, images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=500&auto=format&fit=crop'], category: 'Electronics', storeId: 'mock-store-1' },
    { id: 'mock-prod-4', name: 'USB-C Hub', description: 'Multi-port USB-C adapter.', mrp: 59.99, price: 39.99, images: ['https://images.unsplash.com/photo-1616410011236-7a42121dd981?q=80&w=500&auto=format&fit=crop'], category: 'Accessories', storeId: 'mock-store-1' },
    { id: 'mock-prod-5', name: 'Noise Cancelling Headphones', description: 'Premium ANC headphones.', mrp: 299.99, price: 249.99, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop'], category: 'Audio', storeId: 'mock-store-1' },
    { id: 'mock-prod-6', name: 'Smartwatch', description: 'Fitness tracker and smartwatch.', mrp: 199.99, price: 179.99, images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=500&auto=format&fit=crop'], category: 'Wearables', storeId: 'mock-store-1' },
    // PC Components Co. (mock-store-2)
    { id: 'mock-prod-7', name: 'Graphics Card RTX 4090', description: 'High-end gaming graphics card.', mrp: 1999.99, price: 1599.99, images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=500&auto=format&fit=crop'], category: 'Components', storeId: 'mock-store-2' },
    { id: 'mock-prod-8', name: 'Motherboard Z790', description: 'ATX gaming motherboard.', mrp: 349.99, price: 299.99, images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop'], category: 'Components', storeId: 'mock-store-2' },
    { id: 'mock-prod-9', name: 'NVMe SSD 2TB', description: 'Ultra-fast PCIe Gen4 NVMe SSD.', mrp: 199.99, price: 149.99, images: ['https://images.unsplash.com/photo-1628557044797-f21a177c370c?q=80&w=500&auto=format&fit=crop'], category: 'Storage', storeId: 'mock-store-2' },
    { id: 'mock-prod-10', name: 'Gaming Chair', description: 'Ergonomic racing style gaming chair.', mrp: 299.99, price: 249.99, images: ['https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=500&auto=format&fit=crop'], category: 'Furniture', storeId: 'mock-store-2' },
    { id: 'mock-prod-11', name: 'VR Headset', description: 'Next-gen virtual reality headset.', mrp: 499.99, price: 399.99, images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=500&auto=format&fit=crop'], category: 'VR', storeId: 'mock-store-2' },
    { id: 'mock-prod-12', name: '1080p Webcam', description: 'HD streaming webcam.', mrp: 79.99, price: 59.99, images: ['https://images.unsplash.com/photo-1626218174358-7769486c4b79?q=80&w=500&auto=format&fit=crop'], category: 'Accessories', storeId: 'mock-store-2' },
  ]
  for (const p of productsData) await prisma.product.create({ data: p })
  console.log('Created Products.')

  // 5. Addresses
  const addressesData = [
    { id: 'mock-addr-1', userId: 'mock-buyer-1', name: 'Alice Buyer', email: 'alice@example.com', street: '123 Apple St', city: 'Cupertino', state: 'CA', zip: '95014', country: 'USA', phone: '1231231234' },
    { id: 'mock-addr-2', userId: 'mock-buyer-2', name: 'Bob Buyer', email: 'bob@example.com', street: '456 Windows Rd', city: 'Redmond', state: 'WA', zip: '98052', country: 'USA', phone: '3213214321' }
  ]
  for (const a of addressesData) await prisma.address.create({ data: a })
  console.log('Created Addresses.')

  // 6. Orders and OrderItems
  const ordersData = [
    {
      id: 'mock-order-1', userId: 'mock-buyer-1', storeId: 'mock-store-1', addressId: 'mock-addr-1',
      total: 129.98, status: OrderStatus.DELIVERED, isPaid: true, paymentMethod: PaymentMethod.STRIPE,
      items: [ { productId: 'mock-prod-1', quantity: 1, price: 29.99 }, { productId: 'mock-prod-2', quantity: 1, price: 99.99 } ]
    },
    {
      id: 'mock-order-2', userId: 'mock-buyer-2', storeId: 'mock-store-2', addressId: 'mock-addr-2',
      total: 459.98, status: OrderStatus.SHIPPED, isPaid: true, paymentMethod: PaymentMethod.STRIPE,
      items: [ { productId: 'mock-prod-11', quantity: 1, price: 399.99 }, { productId: 'mock-prod-12', quantity: 1, price: 59.99 } ]
    },
    {
      id: 'mock-order-3', userId: 'mock-buyer-1', storeId: 'mock-store-1', addressId: 'mock-addr-1',
      total: 179.99, status: OrderStatus.PROCESSING, isPaid: true, paymentMethod: PaymentMethod.STRIPE,
      items: [ { productId: 'mock-prod-6', quantity: 1, price: 179.99 } ]
    }
  ]
  
  for (const o of ordersData) {
    const { items, ...orderInfo } = o
    await prisma.order.create({ data: { ...orderInfo, orderItems: { create: items } } })
  }
  console.log('Created Orders and OrderItems.')

  // 7. Ratings
  const ratingsData = [
    { userId: 'mock-buyer-1', productId: 'mock-prod-1', orderId: 'mock-order-1', rating: 5, review: 'Fantastic mouse, very responsive!' },
    { userId: 'mock-buyer-1', productId: 'mock-prod-2', orderId: 'mock-order-1', rating: 4, review: 'Great keyboard but slightly loud.' },
    { userId: 'mock-buyer-2', productId: 'mock-prod-11', orderId: 'mock-order-2', rating: 5, review: 'Incredible VR experience, mind blown.' },
    { userId: 'mock-buyer-2', productId: 'mock-prod-12', orderId: 'mock-order-2', rating: 4, review: 'Good webcam for the price.' }
  ]
  for (const r of ratingsData) await prisma.rating.create({ data: r })
  console.log('Created Ratings.')

  // 8. Coupons
  const couponsData = [
    { code: 'WELCOME10', description: '10% off for new users', discount: 10, forNewUser: true, isPublic: true, expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
    { code: 'SUMMER20', description: '20% off summer sale', discount: 20, forNewUser: false, isPublic: true, expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
  ]
  for (const c of couponsData) await prisma.coupon.create({ data: c })
  console.log('Created Coupons.')

  console.log('Comprehensive seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
