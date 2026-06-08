export const getStatusColor = (status) => {
  switch (status) {
    case 'DRAFT': return 'bg-yellow-200 text-yellow-800';
    case 'SUBMITTED': return 'bg-blue-200 text-blue-800';
    case 'COMPLETED': return 'bg-green-200 text-green-800';
    case 'REJECTED': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-200';
  }
};