import { format, startOfDay, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export const calculateKPIs = (orders) => {
    // 1. Total Revenue
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)

    // 2. Average Ticket (Ticket Promedio)
    const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0

    // 3. Payment Methods Split
    const paymentMethods = orders.reduce((acc, o) => {
        const method = o.payment_method || 'unknown'
        acc[method] = (acc[method] || 0) + (Number(o.total) || 0)
        return acc
    }, {})

    // 4. Order Type Split (Delivery vs Take Away)
    const orderTypes = orders.reduce((acc, o) => {
        const type = o.order_type === 'delivery' ? 'Delivery' : 'Retiro'
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})

    return {
        totalRevenue,
        totalOrders: orders.length,
        averageTicket,
        paymentMethods,
        orderTypes
    }
}

export const getDailyRevenueData = (orders, days = 7) => {
    // Generate array of last N days
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)

    // Create map initialized with 0 for all days
    const dayMap = new Map()
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
        // Format: '15 Ene'
        dayMap.set(format(date, 'd MMM', { locale: es }), 0)
    })

    // Fill with actual data
    orders.forEach(order => {
        const orderDate = new Date(order.created_at)
        // Only count if within range (API usually handles this but good to double check if we fetch more)
        if (orderDate >= startDate) {
            const key = format(orderDate, 'd MMM', { locale: es })
            if (dayMap.has(key)) {
                dayMap.set(key, dayMap.get(key) + (Number(order.total) || 0))
            }
        }
    })

    // Convert to Recharts array format: [{name: '15 Ene', value: 12000}, ...]
    return Array.from(dayMap).map(([name, value]) => ({ name, value }))
}

export const getHourlyHeatmapData = (orders) => {
    const hours = Array(24).fill(0)

    orders.forEach(order => {
        const hour = new Date(order.created_at).getHours()
        hours[hour]++
    })

    // Prepare for Bar Chart: 00:00 - 23:00
    // Filter out late night/morning hours if no orders to save space? 
    // Or simpler: Just return 18:00 to 02:00 for a burger shop usually.
    // Let's return full 24h for correctness, UI can slice.
    return hours.map((count, hour) => ({
        name: `${hour}:00`,
        orders: count
    }))
}

export const getTopProductsData = (orders) => {
    // We need 'order_items' populated in the orders
    const productCounts = {}

    orders.forEach(order => {
        if (order.order_items) {
            order.order_items.forEach(item => {
                const name = item.products?.name || 'Desconocido'
                productCounts[name] = (productCounts[name] || 0) + 1
            })
        }
    })

    // Convert to array and sort
    return Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5
}
