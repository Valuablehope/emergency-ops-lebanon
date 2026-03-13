import * as XLSX from 'xlsx';

export const exportToXlsx = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Generating a buffer
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportPlatformData = async (
    facilities: any[], 
    shelterUpdates?: any[],
    distributions?: any[]
) => {
  const workbook = XLSX.utils.book_new();

  // Facilities Sheet
  if (facilities && facilities.length > 0) {
    const facilitiesData = facilities.map(f => ({
      Name: f.name,
      Type: f.type,
      Status: f.status,
      Lat: f.lat,
      Lng: f.lng,
      PCode: f.pcode || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(facilitiesData);
    XLSX.utils.book_append_sheet(workbook, ws, "Facilities");
  }

  // Shelter Updates Sheet
  if (shelterUpdates && shelterUpdates.length > 0) {
    const shelterData = shelterUpdates.map(u => ({
      FacilityID: u.facilityId,
      Occupancy: u.occupancy,
      Capacity: u.capacity,
      WASH_Status: u.washStatus,
      Date: new Date(u.timestamp).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(shelterData);
    XLSX.utils.book_append_sheet(workbook, ws, "Shelter Updates");
  }

  // Distributions Sheet
  if (distributions && distributions.length > 0) {
    const distData = distributions.map(d => ({
      PartnerID: d.partnerId,
      FacilityID: d.facilityId,
      Campaign: d.campaignName,
      Items: d.itemType,
      Quantity: d.quantity,
      Households: d.householdsReached,
      Status: d.status,
      Date: new Date(d.date).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(distData);
    XLSX.utils.book_append_sheet(workbook, ws, "Distributions");
  }

  XLSX.writeFile(workbook, `Emergency_Ops_Lebanon_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
