import { BinRecord, RouteInfo, DailyStats, Zone } from '@/types';

// ===== REAL ROUTE DATASET (from Route_Dataset) =====
export const routeDataset: RouteInfo[] = [
  { routeId: 'DA01', truckNumber: 'TR001', zone: 'Central–West', sourceBin: 'HYD-C01', destination: 'Jawaharnagar', binFlow: 'C01→C03→W02→C07→W05→C10→W08→C12→W11', bins: ['C01','C03','W02','C07','W05','C10','W08','C12','W11'], distanceKm: 28, fuelUsed: 9.33, fuelSaved: 2.8, status: 'completed' },
  { routeId: 'DA02', truckNumber: 'TR002', zone: 'Central–IT', sourceBin: 'HYD-C02', destination: 'Jawaharnagar', binFlow: 'C02→I01→C04→I03→C06→I06→C09', bins: ['C02','I01','C04','I03','C06','I06','C09'], distanceKm: 32, fuelUsed: 10.67, fuelSaved: 3.2, status: 'completed' },
  { routeId: 'DA03', truckNumber: 'TR003', zone: 'IT–West', sourceBin: 'HYD-I02', destination: 'Jawaharnagar', binFlow: 'I02→W01→I04→W04→I07→W07', bins: ['I02','W01','I04','W04','I07','W07'], distanceKm: 34, fuelUsed: 11.33, fuelSaved: 3.4, status: 'in-progress' },
  { routeId: 'DA04', truckNumber: 'TR004', zone: 'IT–Central', sourceBin: 'HYD-I05', destination: 'Jawaharnagar', binFlow: 'I05→C05→I08→C08→I10→C11', bins: ['I05','C05','I08','C08','I10','C11'], distanceKm: 26, fuelUsed: 8.67, fuelSaved: 2.6, status: 'completed' },
  { routeId: 'DA05', truckNumber: 'TR005', zone: 'North–East', sourceBin: 'HYD-N01', destination: 'Jawaharnagar', binFlow: 'N01→N04→E02→N06→E05→N10→E08', bins: ['N01','N04','E02','N06','E05','N10','E08'], distanceKm: 27, fuelUsed: 9, fuelSaved: 2.7, status: 'completed' },
  { routeId: 'DA06', truckNumber: 'TR006', zone: 'East–North', sourceBin: 'HYD-E01', destination: 'Jawaharnagar', binFlow: 'E01→N02→E03→N05→E06→N08', bins: ['E01','N02','E03','N05','E06','N08'], distanceKm: 38, fuelUsed: 12.67, fuelSaved: 3.8, status: 'in-progress' },
  { routeId: 'DA07', truckNumber: 'TR007', zone: 'North', sourceBin: 'HYD-N03', destination: 'Jawaharnagar', binFlow: 'N03→N07→N09→N11→N13→N15', bins: ['N03','N07','N09','N11','N13','N15'], distanceKm: 30, fuelUsed: 10, fuelSaved: 3.0, status: 'completed' },
  { routeId: 'DA08', truckNumber: 'TR008', zone: 'East', sourceBin: 'HYD-E04', destination: 'Jawaharnagar', binFlow: 'E04→E07→E09→E11→E13→E15', bins: ['E04','E07','E09','E11','E13','E15'], distanceKm: 36, fuelUsed: 12, fuelSaved: 3.6, status: 'pending' },
  { routeId: 'DA09', truckNumber: 'TR009', zone: 'South', sourceBin: 'HYD-S01', destination: 'Jawaharnagar', binFlow: 'S01→S03→S05→S07→S09→S11→S13→S15', bins: ['S01','S03','S05','S07','S09','S11','S13','S15'], distanceKm: 22, fuelUsed: 7.33, fuelSaved: 2.2, status: 'completed' },
  { routeId: 'DA10', truckNumber: 'TR010', zone: 'Old City', sourceBin: 'HYD-S02', destination: 'Jawaharnagar', binFlow: 'S02→S04→C06→S06→C07→S10→C05', bins: ['S02','S04','C06','S06','C07','S10','C05'], distanceKm: 31, fuelUsed: 10.33, fuelSaved: 3.1, status: 'in-progress' },
  { routeId: 'DA11', truckNumber: 'TR011', zone: 'South–Central', sourceBin: 'HYD-S08', destination: 'Jawaharnagar', binFlow: 'S08→C08→S12→C14→S14', bins: ['S08','C08','S12','C14','S14'], distanceKm: 29, fuelUsed: 9.67, fuelSaved: 2.9, status: 'completed' },
  { routeId: 'DA12', truckNumber: 'TR012', zone: 'South', sourceBin: 'HYD-S16', destination: 'Jawaharnagar', binFlow: 'S16→S17→S18 (overflow)', bins: ['S16','S17','S18'], distanceKm: 35, fuelUsed: 11.67, fuelSaved: 3.5, status: 'pending' },
  { routeId: 'DA13', truckNumber: 'TR013', zone: 'West Residential', sourceBin: 'HYD-W03', destination: 'Jawaharnagar', binFlow: 'W03→W06→W09→W12→W15', bins: ['W03','W06','W09','W12','W15'], distanceKm: 24, fuelUsed: 8, fuelSaved: 2.4, status: 'completed' },
  { routeId: 'DA14', truckNumber: 'TR014', zone: 'IT Residential', sourceBin: 'HYD-I11', destination: 'Jawaharnagar', binFlow: 'I11→I12→I13→I14→I15', bins: ['I11','I12','I13','I14','I15'], distanceKm: 25, fuelUsed: 8.33, fuelSaved: 2.5, status: 'completed' },
  { routeId: 'DA15', truckNumber: 'TR015', zone: 'East Residential', sourceBin: 'HYD-E10', destination: 'Jawaharnagar', binFlow: 'E10→E12→E14', bins: ['E10','E12','E14'], distanceKm: 20, fuelUsed: 6.67, fuelSaved: 2.0, status: 'completed' },
  { routeId: 'DA16', truckNumber: 'TR016', zone: 'North Residential', sourceBin: 'HYD-N12', destination: 'Jawaharnagar', binFlow: 'N12→N14', bins: ['N12','N14'], distanceKm: 18, fuelUsed: 6, fuelSaved: 1.8, status: 'completed' },
  { routeId: 'DA17', truckNumber: 'TR017', zone: 'Boundary Mix', sourceBin: 'HYD-C13', destination: 'Jawaharnagar', binFlow: 'C13→W13→I14→E14→S14→N14', bins: ['C13','W13','I14','E14','S14','N14'], distanceKm: 40, fuelUsed: 13.33, fuelSaved: 4.0, status: 'pending' },
  { routeId: 'DA18', truckNumber: 'TR018', zone: 'Overflow Assist', sourceBin: 'HYD-E05', destination: 'Jawaharnagar', binFlow: 'E05→W14→S11→N11', bins: ['E05','W14','S11','N11'], distanceKm: 33, fuelUsed: 11, fuelSaved: 3.3, status: 'in-progress' },
  { routeId: 'DA19', truckNumber: 'TR019', zone: 'IT–East', sourceBin: 'HYD-I09', destination: 'Jawaharnagar', binFlow: 'I09→E09→I08→E08', bins: ['I09','E09','I08','E08'], distanceKm: 30, fuelUsed: 10, fuelSaved: 3.0, status: 'completed' },
  { routeId: 'DA20', truckNumber: 'TR020', zone: 'Central Cleanup', sourceBin: 'HYD-C15', destination: 'Jawaharnagar', binFlow: 'C15→C14→C13', bins: ['C15','C14','C13'], distanceKm: 16, fuelUsed: 5.33, fuelSaved: 1.6, status: 'completed' },
  { routeId: 'DA21', truckNumber: 'TR021', zone: 'West Final', sourceBin: 'HYD-W10', destination: 'Jawaharnagar', binFlow: 'W10→W11→W14', bins: ['W10','W11','W14'], distanceKm: 14, fuelUsed: 4.67, fuelSaved: 1.4, status: 'completed' },
  { routeId: 'DA22', truckNumber: 'TR022', zone: 'North Final', sourceBin: 'HYD-N14', destination: 'Jawaharnagar', binFlow: 'N14→N15', bins: ['N14','N15'], distanceKm: 12, fuelUsed: 4, fuelSaved: 1.2, status: 'completed' },
  { routeId: 'DA23', truckNumber: 'TR023', zone: 'East Final', sourceBin: 'HYD-E06', destination: 'Jawaharnagar', binFlow: 'E06→E07', bins: ['E06','E07'], distanceKm: 13, fuelUsed: 4.33, fuelSaved: 1.3, status: 'completed' },
  { routeId: 'DA24', truckNumber: 'TR024', zone: 'South Final', sourceBin: 'HYD-S13', destination: 'Jawaharnagar', binFlow: 'S13→S14→S15', bins: ['S13','S14','S15'], distanceKm: 15, fuelUsed: 5, fuelSaved: 1.5, status: 'completed' },
];

// ===== HYDERABAD BIN DATASET =====
// Zones with real Hyderabad coordinates and sub-locations

interface BinDef {
  binCode: string;
  zone: Zone;
  locationName: string;
  subLocation: string;
  lat: number;
  lng: number;
  areaType: 'Residential' | 'Commercial' | 'Industrial' | 'Institutional' | 'Mixed';
  capacity: number;
  wasteType: 'Wet' | 'Dry' | 'Mixed';
}

const hyderabadBins: BinDef[] = [
  // Central Zone (C01–C15) – real PDF data
  { binCode: 'C01', zone: 'Central', locationName: 'Abids Commercial Area', subLocation: 'Commercial District', lat: 17.3966, lng: 78.4867, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'C02', zone: 'Central', locationName: 'Koti Bus Stand', subLocation: 'Transit Hub', lat: 17.3895, lng: 78.494, areaType: 'Commercial', capacity: 150, wasteType: 'Dry' },
  { binCode: 'C03', zone: 'Central', locationName: 'Nampally Exhibition Ground', subLocation: 'Event Grounds', lat: 17.3851, lng: 78.4937, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'C04', zone: 'Central', locationName: 'Narayanguda Circle', subLocation: 'Road Junction', lat: 17.4002, lng: 78.4826, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'C05', zone: 'Central', locationName: 'Lakdikapul Junction', subLocation: 'Transit Junction', lat: 17.4208, lng: 78.4869, areaType: 'Commercial', capacity: 100, wasteType: 'Wet' },
  { binCode: 'C06', zone: 'Central', locationName: 'Chaderghat Bridge', subLocation: 'Bridge Area', lat: 17.4005, lng: 78.5037, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'C07', zone: 'Central', locationName: 'Kachiguda Circle', subLocation: 'Transit Circle', lat: 17.3831, lng: 78.5006, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'C08', zone: 'Central', locationName: 'Sultan Bazaar (side lanes)', subLocation: 'Market Lanes', lat: 17.392, lng: 78.479, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'C09', zone: 'Central', locationName: 'Moazzam Jahi Market lanes', subLocation: 'Market Area', lat: 17.3858, lng: 78.4889, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'C10', zone: 'Central', locationName: 'Khairatabad local market', subLocation: 'Local Market', lat: 17.3995, lng: 78.4768, areaType: 'Residential', capacity: 150, wasteType: 'Wet' },
  { binCode: 'C11', zone: 'Central', locationName: 'Punjagutta Intersection', subLocation: 'Intersection', lat: 17.4358, lng: 78.4659, areaType: 'Commercial', capacity: 200, wasteType: 'Dry' },
  { binCode: 'C12', zone: 'Central', locationName: 'Ameerpet Metro Station', subLocation: 'Metro Station', lat: 17.4322, lng: 78.4482, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'C13', zone: 'Central', locationName: 'Begumpet Bus Stand', subLocation: 'Bus Stand', lat: 17.4383, lng: 78.4656, areaType: 'Commercial', capacity: 150, wasteType: 'Dry' },
  { binCode: 'C14', zone: 'Central', locationName: 'Begumpet side markets', subLocation: 'Side Markets', lat: 17.447, lng: 78.473, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'C15', zone: 'Central', locationName: 'NIMS Hospital entrance', subLocation: 'Hospital Gate', lat: 17.38504, lng: 78.48667, areaType: 'Institutional', capacity: 200, wasteType: 'Mixed' },

  // North Zone (N01–N15)
  { binCode: 'N01', zone: 'North', locationName: 'Secunderabad Railway Station', subLocation: 'Railway Station', lat: 17.4395, lng: 78.4983, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'N02', zone: 'North', locationName: 'Monda Market', subLocation: 'Market Area', lat: 17.4571, lng: 78.4978, areaType: 'Commercial', capacity: 200, wasteType: 'Wet' },
  { binCode: 'N03', zone: 'North', locationName: 'Secunderabad Clock Tower', subLocation: 'Clock Tower', lat: 17.4474, lng: 78.4989, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'N04', zone: 'North', locationName: 'Chelmsford Road', subLocation: 'Residential Road', lat: 17.4482, lng: 78.495, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'N05', zone: 'North', locationName: 'Parade Grounds kiosks', subLocation: 'Event Kiosks', lat: 17.431, lng: 78.508, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'N06', zone: 'North', locationName: 'Tarnaka MMTS Station', subLocation: 'MMTS Station', lat: 17.4239, lng: 78.5164, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'N07', zone: 'North', locationName: 'Osmania University Main Gate', subLocation: 'University Gate', lat: 17.41897, lng: 78.5266, areaType: 'Institutional', capacity: 200, wasteType: 'Dry' },
  { binCode: 'N08', zone: 'North', locationName: 'Amberpet local market', subLocation: 'Local Market', lat: 17.419, lng: 78.521, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'N09', zone: 'North', locationName: 'Habsiguda local market', subLocation: 'Local Market', lat: 17.438, lng: 78.505, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'N10', zone: 'North', locationName: 'ECIL Bus Stop', subLocation: 'Bus Stop', lat: 17.5045, lng: 78.5535, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'N11', zone: 'North', locationName: 'ECIL X Roads', subLocation: 'X Roads', lat: 17.504, lng: 78.5384, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'N12', zone: 'North', locationName: 'Moula Ali Temple', subLocation: 'Temple Area', lat: 17.4104, lng: 78.5588, areaType: 'Institutional', capacity: 100, wasteType: 'Wet' },
  { binCode: 'N13', zone: 'North', locationName: 'Malkajgiri Temple Area', subLocation: 'Temple Area', lat: 17.4965, lng: 78.5257, areaType: 'Residential', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'N14', zone: 'North', locationName: 'Lalaguda residential streets', subLocation: 'Residential Streets', lat: 17.4515, lng: 78.505, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'N15', zone: 'North', locationName: 'Medchal Toll Junction', subLocation: 'Toll Junction', lat: 17.6196, lng: 78.5099, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },

  // West Zone (W01–W15)
  { binCode: 'W01', zone: 'West', locationName: 'Kukatpally Bus Stand', subLocation: 'Bus Stand', lat: 17.4855, lng: 78.3952, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'W02', zone: 'West', locationName: 'KPHB Colony Main Road', subLocation: 'Main Road', lat: 17.4941, lng: 78.4013, areaType: 'Residential', capacity: 150, wasteType: 'Wet' },
  { binCode: 'W03', zone: 'West', locationName: 'Kukatpally PS Area', subLocation: 'Police Station Area', lat: 17.4878, lng: 78.3893, areaType: 'Residential', capacity: 150, wasteType: 'Wet' },
  { binCode: 'W04', zone: 'West', locationName: 'Kukatpally Dairy', subLocation: 'Dairy Area', lat: 17.488, lng: 78.392, areaType: 'Mixed', capacity: 100, wasteType: 'Mixed' },
  { binCode: 'W05', zone: 'West', locationName: 'Moosapet Local Market', subLocation: 'Local Market', lat: 17.451, lng: 78.448, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W06', zone: 'West', locationName: 'Balanagar Market', subLocation: 'Market Area', lat: 17.466, lng: 78.454, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W07', zone: 'West', locationName: 'Sanathnagar Market Lanes', subLocation: 'Market Lanes', lat: 17.433, lng: 78.468, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W08', zone: 'West', locationName: 'Bowenpally X Roads', subLocation: 'X Roads', lat: 17.497, lng: 78.5045, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W09', zone: 'West', locationName: 'Bowenpally Residential Cluster', subLocation: 'Residential Cluster', lat: 17.497, lng: 78.497, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'W10', zone: 'West', locationName: 'Chintal Basti Small Market', subLocation: 'Small Market', lat: 17.471, lng: 78.517, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'W11', zone: 'West', locationName: 'Pragathi Nagar Local Market', subLocation: 'Local Market', lat: 17.452, lng: 78.38, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'W12', zone: 'West', locationName: 'Chandanagar Local Market', subLocation: 'Local Market', lat: 17.442, lng: 78.38, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'W13', zone: 'West', locationName: 'Madhucon Mall Side Lanes', subLocation: 'Mall Side Lanes', lat: 17.451, lng: 78.402, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W14', zone: 'West', locationName: 'Miyapur Metro Station', subLocation: 'Metro Station', lat: 17.4749, lng: 78.3962, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'W15', zone: 'West', locationName: 'Kukatpally Food Street (side lanes)', subLocation: 'Food Street', lat: 17.4865, lng: 78.4025, areaType: 'Mixed', capacity: 100, wasteType: 'Wet' },

  // IT Corridor Zone (I01–I15)
  { binCode: 'I01', zone: 'IT Corridor', locationName: 'Madhapur Hi-Tech Corridor', subLocation: 'Hi-Tech Corridor', lat: 17.4421, lng: 78.3917, areaType: 'Commercial', capacity: 200, wasteType: 'Dry' },
  { binCode: 'I02', zone: 'IT Corridor', locationName: 'Hitech City Railway Station', subLocation: 'Railway Station', lat: 17.4457, lng: 78.3786, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'I03', zone: 'IT Corridor', locationName: 'Hitech City Service Lanes', subLocation: 'Service Lanes', lat: 17.44, lng: 78.377, areaType: 'Residential', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'I04', zone: 'IT Corridor', locationName: 'Kondapur Local Market', subLocation: 'Local Market', lat: 17.439, lng: 78.384, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'I05', zone: 'IT Corridor', locationName: 'Gachibowli IT Park', subLocation: 'IT Park', lat: 17.4325, lng: 78.408, areaType: 'Commercial', capacity: 200, wasteType: 'Dry' },
  { binCode: 'I06', zone: 'IT Corridor', locationName: 'Gachibowli Stadium Area', subLocation: 'Stadium Area', lat: 17.4435, lng: 78.3636, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'I07', zone: 'IT Corridor', locationName: 'Manikonda Local Market', subLocation: 'Local Market', lat: 17.402, lng: 78.357, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'I08', zone: 'IT Corridor', locationName: 'Jubilee Hills Check Post', subLocation: 'Check Post', lat: 17.4218, lng: 78.4193, areaType: 'Commercial', capacity: 150, wasteType: 'Dry' },
  { binCode: 'I09', zone: 'IT Corridor', locationName: 'Jubilee Hills Side Markets', subLocation: 'Side Markets', lat: 17.4238, lng: 78.4138, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'I10', zone: 'IT Corridor', locationName: 'Ramada Hotel Junction', subLocation: 'Hotel Junction', lat: 17.4105, lng: 78.4216, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'I11', zone: 'IT Corridor', locationName: 'Banjara Hills Road No 1', subLocation: 'Road No 1', lat: 17.4167, lng: 78.4231, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'I12', zone: 'IT Corridor', locationName: 'Church Gate Community Area', subLocation: 'Community Area', lat: 17.416, lng: 78.424, areaType: 'Residential', capacity: 150, wasteType: 'Wet' },
  { binCode: 'I13', zone: 'IT Corridor', locationName: 'Shaikpet Circle', subLocation: 'Circle Junction', lat: 17.3964, lng: 78.3867, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'I14', zone: 'IT Corridor', locationName: 'Tolichowki Small Markets', subLocation: 'Small Markets', lat: 17.3836, lng: 78.4146, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'I15', zone: 'IT Corridor', locationName: 'NGRI Service Lanes', subLocation: 'Service Lanes', lat: 17.412, lng: 78.405, areaType: 'Institutional', capacity: 150, wasteType: 'Dry' },

  // East Zone (E01–E15)
  { binCode: 'E01', zone: 'East', locationName: 'Uppal Ring Road Bus Stand', subLocation: 'Bus Stand', lat: 17.3875, lng: 78.5392, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'E02', zone: 'East', locationName: 'Uppal X Roads', subLocation: 'X Roads', lat: 17.3889, lng: 78.5485, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'E03', zone: 'East', locationName: 'Ramanthapur Bazaar', subLocation: 'Bazaar', lat: 17.4, lng: 78.545, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E04', zone: 'East', locationName: 'Habsiguda Market', subLocation: 'Market Area', lat: 17.438, lng: 78.505, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E05', zone: 'East', locationName: 'Tarnaka Market', subLocation: 'Market Area', lat: 17.4239, lng: 78.5164, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'E06', zone: 'East', locationName: 'Osmania University Gate (side lanes)', subLocation: 'University Gate', lat: 17.42, lng: 78.526, areaType: 'Institutional', capacity: 150, wasteType: 'Dry' },
  { binCode: 'E07', zone: 'East', locationName: 'Amberpet Local Market', subLocation: 'Local Market', lat: 17.419, lng: 78.521, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E08', zone: 'East', locationName: 'Kothapet Small Market', subLocation: 'Small Market', lat: 17.353, lng: 78.544, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E09', zone: 'East', locationName: 'LB Nagar Bus Stop', subLocation: 'Bus Stop', lat: 17.3523, lng: 78.5318, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'E10', zone: 'East', locationName: 'LB Nagar Side Markets', subLocation: 'Side Markets', lat: 17.3525, lng: 78.5375, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E11', zone: 'East', locationName: 'Dilsukhnagar Market Lanes', subLocation: 'Market Lanes', lat: 17.3682, lng: 78.5356, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'E12', zone: 'East', locationName: 'Saroornagar Local Market', subLocation: 'Local Market', lat: 17.355, lng: 78.527, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E13', zone: 'East', locationName: 'Gaddiannaram Market Lanes', subLocation: 'Market Lanes', lat: 17.3525, lng: 78.531, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'E14', zone: 'East', locationName: 'Alkapuri / Nagole Local Market', subLocation: 'Local Market', lat: 17.361, lng: 78.527, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'E15', zone: 'East', locationName: 'Moula Ali Temple Area', subLocation: 'Temple Area', lat: 17.4104, lng: 78.5588, areaType: 'Institutional', capacity: 100, wasteType: 'Wet' },

  // South Zone (S01–S15 + S16–S18 for overflow routes)
  { binCode: 'S01', zone: 'South', locationName: 'Charminar Area', subLocation: 'Heritage Area', lat: 17.3616, lng: 78.4747, areaType: 'Institutional', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'S02', zone: 'South', locationName: 'Charminar Bazar Area', subLocation: 'Bazaar', lat: 17.3608, lng: 78.4761, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'S03', zone: 'South', locationName: 'Laad Bazaar', subLocation: 'Bazaar', lat: 17.3611, lng: 78.474, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'S04', zone: 'South', locationName: 'Bahadurpura Local Market', subLocation: 'Local Market', lat: 17.3565, lng: 78.5242, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'S05', zone: 'South', locationName: 'Falaknuma Railway Station', subLocation: 'Railway Station', lat: 17.3577, lng: 78.4881, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'S06', zone: 'South', locationName: 'Falaknuma Palace Approach', subLocation: 'Palace Approach', lat: 17.3565, lng: 78.484, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S07', zone: 'South', locationName: 'Chandrayangutta Bazaar', subLocation: 'Bazaar', lat: 17.3385, lng: 78.4675, areaType: 'Commercial', capacity: 200, wasteType: 'Mixed' },
  { binCode: 'S08', zone: 'South', locationName: 'Santosh Nagar Ward Centre', subLocation: 'Ward Centre', lat: 17.3779, lng: 78.5134, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S09', zone: 'South', locationName: 'Madannapet Local Bazaar', subLocation: 'Local Bazaar', lat: 17.375, lng: 78.49, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'S10', zone: 'South', locationName: 'Asmangadh Market', subLocation: 'Market Area', lat: 17.345, lng: 78.517, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S11', zone: 'South', locationName: 'Saroornagar Fringe Markets', subLocation: 'Fringe Markets', lat: 17.355, lng: 78.527, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S12', zone: 'South', locationName: 'Kothapet Fringe Lanes', subLocation: 'Fringe Lanes', lat: 17.353, lng: 78.544, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S13', zone: 'South', locationName: 'Attapur Local Market', subLocation: 'Local Market', lat: 17.36, lng: 78.413, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S14', zone: 'South', locationName: 'Mehdipatnam Local Lanes', subLocation: 'Local Lanes', lat: 17.3852, lng: 78.4351, areaType: 'Mixed', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'S15', zone: 'South', locationName: 'Tolichowki Service Lanes', subLocation: 'Service Lanes', lat: 17.3836, lng: 78.4146, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S16', zone: 'South', locationName: 'Ibrahimpatnam Market', subLocation: 'Market Road', lat: 17.2690, lng: 78.5500, areaType: 'Commercial', capacity: 150, wasteType: 'Mixed' },
  { binCode: 'S17', zone: 'South', locationName: 'Kandukur Village Center', subLocation: 'Village Center', lat: 17.2480, lng: 78.5650, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
  { binCode: 'S18', zone: 'South', locationName: 'Abdullapurmet Gram Panchayat', subLocation: 'Gram Panchayat', lat: 17.3050, lng: 78.5780, areaType: 'Residential', capacity: 100, wasteType: 'Wet' },
];

// Assign fill levels with realistic distribution
function getPriority(fillLevel: number): 1 | 2 | 3 {
  if (fillLevel >= 80) return 3;
  if (fillLevel >= 50) return 2;
  return 1;
}

// Seeded random for reproducibility
let seed = 42;
function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function generateRealBins(): BinRecord[] {
  seed = 42; // reset seed
  const trucks = routeDataset.map(r => r.truckNumber);
  return hyderabadBins.map((def, i) => {
    const fillLevel = Math.floor(seededRandom() * 100);
    const truckIdx = Math.floor(seededRandom() * trucks.length);
    const daysAgo = Math.floor(seededRandom() * 7);
    return {
      id: `rec-${i + 1}`,
      binId: `HYD-${def.binCode}`,
      subLocation: def.subLocation,
      locationName: def.locationName,
      zone: def.zone,
      areaType: def.areaType,
      latitude: def.lat,
      longitude: def.lng,
      capacity: def.capacity,
      fillLevel,
      wasteType: def.wasteType,
      dateObserved: new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0],
      assignedTruck: trucks[truckIdx],
      remarks: seededRandom() > 0.75 ? 'Needs maintenance' : undefined,
      priority: getPriority(fillLevel),
      collected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

// ===== DYNAMIC DATA EVENT BUS =====
// Components subscribe via window event so updates propagate in real time.
export const BIN_UPDATE_EVENT = 'greenroute:bins-updated';

function emitBinsUpdated() {
  try { window.dispatchEvent(new CustomEvent(BIN_UPDATE_EVENT)); } catch {}
}

export function getInitialBins(): BinRecord[] {
  const stored = localStorage.getItem('greenroute_bins_v2');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.length > 0 && parsed[0].zone) return parsed;
  }
  const bins = generateRealBins();
  localStorage.setItem('greenroute_bins_v2', JSON.stringify(bins));
  return bins;
}

export function saveBins(bins: BinRecord[]) {
  localStorage.setItem('greenroute_bins_v2', JSON.stringify(bins));
  emitBinsUpdated();
}

// ===== FILL-LEVEL FUSION =====
// Blend incoming worker observation with historical stored value.
// Recent worker input weighted higher (0.7) than stored history (0.3),
// but if worker reports a HIGHER value (real overflow) we trust it fully.
export function fuseFillLevel(historical: number, incoming: number): number {
  if (incoming >= historical) return Math.min(100, Math.round(incoming));
  const blended = historical * 0.3 + incoming * 0.7;
  return Math.max(0, Math.min(100, Math.round(blended)));
}

// Find a bin by code, location name, or nearest coordinates.
export function findBin(
  bins: BinRecord[],
  query: { binCode?: string; locationName?: string; lat?: number; lng?: number }
): BinRecord | undefined {
  if (query.binCode) {
    const code = query.binCode.replace(/^HYD-/i, '').toUpperCase();
    return bins.find(b => b.binId.replace('HYD-', '').toUpperCase() === code);
  }
  if (query.locationName) {
    const q = query.locationName.toLowerCase();
    return bins.find(b => b.locationName.toLowerCase().includes(q));
  }
  if (query.lat != null && query.lng != null) {
    let best: BinRecord | undefined;
    let bestD = Infinity;
    bins.forEach(b => {
      const d = haversineKm(b.latitude, b.longitude, query.lat!, query.lng!);
      if (d < bestD) { bestD = d; best = b; }
    });
    return best;
  }
  return undefined;
}

// Apply a worker observation: fuses fill level, updates timestamp, persists, emits event.
export function applyWorkerObservation(input: {
  binCode?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  observedFillLevel: number;
  remarks?: string;
}): BinRecord | null {
  const bins = getInitialBins();
  const target = findBin(bins, input);
  if (!target) return null;
  const fused = fuseFillLevel(target.fillLevel, input.observedFillLevel);
  const updated = bins.map(b => b.id === target.id ? {
    ...b,
    fillLevel: fused,
    priority: getPriority(fused),
    remarks: input.remarks ?? b.remarks,
    dateObserved: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  } : b);
  saveBins(updated);
  return updated.find(b => b.id === target.id) || null;
}

// ===== HAVERSINE DISTANCE (km) =====
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ===== DYNAMIC ROUTE OPTIMIZATION =====
// Source and destination bins stay fixed. Intermediate bins are reordered
// using a hybrid score: high fill level first, then nearest-neighbor.
// Returns ordered list of bin codes (without source/destination duplicated).
export function optimizeRouteBins(
  bins: BinRecord[],
  routeBinCodes: string[]
): string[] {
  if (routeBinCodes.length <= 2) return routeBinCodes;
  const codeToBin: Record<string, BinRecord> = {};
  bins.forEach(b => { codeToBin[b.binId.replace('HYD-', '')] = b; });

  const source = routeBinCodes[0];
  const destination = routeBinCodes[routeBinCodes.length - 1];
  const middle = routeBinCodes.slice(1, -1).filter(c => codeToBin[c]);

  if (middle.length === 0) return [source, destination];

  // Greedy nearest-neighbor weighted by fill level.
  // From current position, score each remaining bin: priorityScore - distanceKm.
  const ordered: string[] = [];
  let current = codeToBin[source];
  const remaining = new Set(middle);

  while (remaining.size > 0 && current) {
    let bestCode: string | null = null;
    let bestScore = -Infinity;
    remaining.forEach(code => {
      const b = codeToBin[code];
      if (!b) return;
      const dist = haversineKm(current!.latitude, current!.longitude, b.latitude, b.longitude);
      // Higher fill = higher urgency. Weight: fillLevel/10 minus distance.
      const score = (b.fillLevel / 10) - dist;
      if (score > bestScore) { bestScore = score; bestCode = code; }
    });
    if (!bestCode) break;
    ordered.push(bestCode);
    remaining.delete(bestCode);
    current = codeToBin[bestCode];
  }
  return [source, ...ordered, destination];
}

// Build dynamic version of routeDataset with re-optimized binFlow strings.
export function getDynamicRoutes(bins?: BinRecord[]): RouteInfo[] {
  const allBins = bins || getInitialBins();
  return routeDataset.map(route => {
    const optimized = optimizeRouteBins(allBins, route.bins);
    return {
      ...route,
      bins: optimized,
      binFlow: optimized.join('→'),
    };
  });
}

// ===== AUTO-FILL DRIFT =====
// Simulates real-world bin filling. Call periodically to keep data "alive".
export function driftFillLevels(): BinRecord[] {
  const bins = getInitialBins();
  const updated = bins.map(b => {
    if (b.collected) return b;
    // Random small increase 0-3% per tick, capped at 100.
    const delta = Math.random() * 3;
    const newFill = Math.min(100, b.fillLevel + delta);
    return {
      ...b,
      fillLevel: Math.round(newFill),
      priority: getPriority(newFill),
      updatedAt: new Date().toISOString(),
    };
  });
  saveBins(updated);
  return updated;
}

// Reset bin store (admin utility).
export function resetBinData(): BinRecord[] {
  const fresh = generateRealBins();
  saveBins(fresh);
  return fresh;
}

// Collection history helpers
import { CollectionRecord } from '@/types';

export function getCollectionHistory(): CollectionRecord[] {
  const stored = localStorage.getItem('greenroute_collection_history');
  return stored ? JSON.parse(stored) : [];
}

export function saveCollectionHistory(history: CollectionRecord[]) {
  localStorage.setItem('greenroute_collection_history', JSON.stringify(history));
}

// Keep backward-compatible exports
export const mockRoutes = routeDataset;

export const mockDailyStats: DailyStats[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.now() - (13 - i) * 86400000);
  seed = 100 + i;
  return {
    date: date.toISOString().split('T')[0],
    binsCollected: Math.floor(25 + seededRandom() * 40),
    totalWasteKg: Math.floor(800 + seededRandom() * 2000),
    distanceKm: parseFloat((50 + seededRandom() * 80).toFixed(1)),
    fuelUsed: parseFloat((15 + seededRandom() * 25).toFixed(1)),
  };
});

// Zone summary for analytics
export function getZoneSummary(bins: BinRecord[]) {
  const zones: Record<string, { total: number; high: number; medium: number; low: number; avgFill: number; totalWaste: number }> = {};
  bins.forEach(b => {
    if (!zones[b.zone]) zones[b.zone] = { total: 0, high: 0, medium: 0, low: 0, avgFill: 0, totalWaste: 0 };
    const z = zones[b.zone];
    z.total++;
    if (b.priority === 3) z.high++;
    else if (b.priority === 2) z.medium++;
    else z.low++;
    z.avgFill += b.fillLevel;
    z.totalWaste += b.capacity * b.fillLevel / 100;
  });
  return Object.entries(zones).map(([zone, data]) => ({
    zone,
    ...data,
    avgFill: Math.round(data.avgFill / data.total),
    totalWaste: Math.round(data.totalWaste),
  }));
}
