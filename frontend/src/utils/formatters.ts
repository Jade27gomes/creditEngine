export const formatDateTime = (dateString: string) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR'); 
};

export const formatDateOnly = (dateString: string) => {
  if (!dateString) return '---';
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('pt-BR');
};