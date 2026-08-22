// Add import at top:
import { sendNotificationEmail, buildStatusUpdateEmail } from '@/lib/email';

// Inside PATCH handler right after status update:
const orderDetails = await prisma.orders.findUnique({
  where: { id: orderId },
  include: { users_orders_client_idTousers: true },
});

if (orderDetails) {
  await sendNotificationEmail({
    to: orderDetails.users_orders_client_idTousers.email,
    subject: `Status Update [${orderDetails.order_number}]: ${newStatus.replace('_', ' ').toUpperCase()}`,
    html: buildStatusUpdateEmail(
      orderDetails.users_orders_client_idTousers.full_name,
      orderDetails.order_number,
      newStatus,
      remarks
    ),
  });
}