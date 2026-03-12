/**
 * PPM Inspection Checklist Data Configuration
 * Based on "INSPECTION CHECK PPM DIES" forms (F-PRO-030-0)
 * 9 Process Types with different checklist items
 */

export const PROCESS_TYPES = [
    { value: 'blank_pierce', label: 'BLANK + PIERCE' },
    { value: 'draw', label: 'DRAW' },
    { value: 'embos', label: 'EMBOS' },
    { value: 'trim', label: 'TRIM' },
    { value: 'form', label: 'FORM' },
    { value: 'flang', label: 'FLANG' },
    { value: 'restrike', label: 'RESTRIKE' },
    { value: 'pierce', label: 'PIERCE' },
    { value: 'cam_pierce', label: 'CAM-PIERCE' },
];

export const CHECKLIST_ITEMS = {
    blank_pierce: [
        { no: 1, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, cacat atau tidak.' },
        { no: 2, description_en: 'The state Stripper pad bent, deformed or not.', description_id: 'Keadaan dari striper plate, bengkok, cacat atau tidak.' },
        { no: 3, description_en: 'Guide post Guide Bush state normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 4, description_en: 'The condition of the cutting edge Punch - Dies normal?', description_id: 'Permukaan dari punch-dies normal atau tidak.' },
        { no: 5, description_en: 'The condition of the cutting edge Punch pierce cracking, chipping, broken, or not.', description_id: 'Kondisi dari pisau potong, punch piercing retak, gompel, patah atau tidak.' },
        { no: 6, description_en: 'Spring damaged, broken, bent, or not.', description_id: 'Spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 7, description_en: 'The state Button dies cracking, chipping or not.', description_id: 'Keadaan button dies retak, gompel atau tidak.' },
        { no: 8, description_en: 'HOOK loose or not.', description_id: 'Hook hilang atau tidak.' },
    ],
    draw: [
        { no: 1, description_en: 'There was a collapse or crack surface area forming.', description_id: 'Ada pecah atau permukaan retak pada area pembentukan (forming).' },
        { no: 2, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, atau tidak.' },
        { no: 3, description_en: 'Scratches on the surface at the groove beat or not.', description_id: 'Baret di permukaan pada alur beat atau tidak.' },
        { no: 4, description_en: 'The surface of the Punch - Dies is normal or not.', description_id: 'Permukaan dari punch-dies normal atau tidak.' },
        { no: 5, description_en: 'The surface of the metal plating is stripping.', description_id: 'Permukaan pada logam plating terkelupas.' },
        { no: 6, description_en: 'Spring / Gas spring damage, broken, bent, damage state use normal.', description_id: 'Spring / gas spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 7, description_en: 'Guide post Guide Bush state normal.', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 8, description_en: 'Blank holder normal state or not.', description_id: 'Blank holder keadaan normal atau tidak.' },
        { no: 9, description_en: 'Upper dies / Lower dies normal state or not.', description_id: 'Upper dies / lower dies keadaan normal atau tidak.' },
        { no: 10, description_en: 'Stopper block damage or not.', description_id: 'Stopper block rusak atau tidak.' },
        { no: 11, description_en: 'The support pole is welded Cushion, damage or not.', description_id: 'Isi bantalan tiang cushion rusak atau tidak.' },
        { no: 12, description_en: 'The area with a slide or Wear plate scuff marks broken or not.', description_id: 'Area slide atau penanda wear plate rusak atau tidak.' },
    ],
    embos: [
        { no: 1, description_en: 'There was a collapse or crack surface area Embos.', description_id: 'Ada pecah atau permukaan retak pada area pembentukan (Embos).' },
        { no: 2, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, atau tidak.' },
        { no: 3, description_en: 'Scratches on the surface at the groove beat or not.', description_id: 'Baret di permukaan pada alur beat atau tidak.' },
        { no: 4, description_en: 'The surface of the Punch - Dies is normal or not.', description_id: 'Permukaan dari punch-dies normal atau tidak.' },
        { no: 5, description_en: 'Spring / Gas spring damage, broken, bent, damage state use normal.', description_id: 'Spring / gas spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 6, description_en: 'Guide post Guide Bush state normal.', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 7, description_en: 'Upper dies / Lower dies normal state or not.', description_id: 'Upper dies / lower dies keadaan normal atau tidak.' },
        { no: 8, description_en: 'Stopper block damage or not.', description_id: 'Stopper block rusak atau tidak.' },
        { no: 9, description_en: 'The support pole is welded Cushion, damage or not.', description_id: 'Isi bantalan tiang cushion rusak atau tidak.' },
        { no: 10, description_en: 'The area with a slide or Wear plate scuff marks broken or not.', description_id: 'Area slide atau penanda wear plate rusak atau tidak.' },
    ],
    trim: [
        { no: 1, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, cacat atau tidak.' },
        { no: 2, description_en: 'The state Stripper pad bent, deformed or not.', description_id: 'Keadaan dari striper plate, bengkok, cacat atau tidak.' },
        { no: 3, description_en: 'Guide post, Guide bush, Guide plate, wear plate The normal state or not.', description_id: 'Guide post guide bush, guide plate, wear plate dalam keadaan normal atau tidak.' },
        { no: 4, description_en: 'The condition of the cutting edge Punch - Dies normal?', description_id: 'Kondisi dari punch pisau potong dies normal?' },
        { no: 5, description_en: 'Spring damaged, broken, bent, or not.', description_id: 'Spring rusak, pecah, bengkok atau tidak.' },
        { no: 6, description_en: 'Scrap cutter is used normally or not.', description_id: 'Scrap cutter bisa digunakan normal atau tidak.' },
        { no: 7, description_en: 'HOOK works normally or not.', description_id: 'Hook bekerja normal atau tidak.' },
    ],
    form: [
        { no: 1, description_en: 'There was a collapse or crack surface area forming?', description_id: 'Ada pecah atau permukaan retak pada area pembentukan (forming).' },
        { no: 2, description_en: 'There was a collapse or crack in the R forming?', description_id: 'Ada pecah atau crack di R forming.' },
        { no: 3, description_en: 'The surface of the Punch - Dies is normal or not.', description_id: 'Surface dari punch-dies normal atau tidak.' },
        { no: 4, description_en: 'The surface of the metal plating is stripping?', description_id: 'Permukaan pada logam plating terkelupas.' },
        { no: 5, description_en: 'Spring / Gas spring damage, broken, bent, damaged state use normal?', description_id: 'Gas spring / spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 6, description_en: 'Guide post Guide Bush state, normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 7, description_en: 'Upper dies / Lower dies normal state or not.', description_id: 'Upper dies / lower dies dalam keadaan normal atau tidak.' },
    ],
    flang: [
        { no: 1, description_en: 'There was a collapse or crack surface area forming?', description_id: 'Ada pecah atau permukaan retak pada area pembentukan (forming).' },
        { no: 2, description_en: 'There was a collapse or crack in the R forming?', description_id: 'Ada pecah atau crack di R forming.' },
        { no: 3, description_en: 'The surface of the Punch - Dies is normal or not.', description_id: 'Surface dari punch-dies normal atau tidak.' },
        { no: 4, description_en: 'Spring / Gas spring damaged, broken, bent, damaged state use normal?', description_id: 'Gas spring / spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 5, description_en: 'Guide post Guide bush, state normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 6, description_en: 'Upper dies / Lower dies normal state or not.', description_id: 'Upper dies / lower dies dalam keadaan normal atau tidak.' },
        { no: 7, description_en: 'Stopper block damaged or not.', description_id: 'Stopper block rusak atau tidak.' },
        { no: 8, description_en: 'The support pole is welded Cushion, damaged or not.', description_id: 'Isi bantalan tiang cushion rusak atau tidak.' },
        { no: 9, description_en: 'The area with a slide or Wear plate scuff marks broken or not.', description_id: 'Area slide atau penanda wear plate rusak atau tidak.' },
    ],
    restrike: [
        { no: 1, description_en: 'There was a collapse or crack surface area forming?', description_id: 'Ada pecah atau permukaan retak pada area pembentukan (forming).' },
        { no: 2, description_en: 'There was a collapse or crack in the R forming?', description_id: 'Ada pecah atau crack di R forming.' },
        { no: 3, description_en: 'The surface of the Punch - Dies is normal or not.', description_id: 'Surface dari punch-dies normal atau tidak.' },
        { no: 4, description_en: 'Spring / Gas spring damaged, broken, bent, damaged state use normal?', description_id: 'Gas spring / spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 5, description_en: 'Guide post Guide bush, state normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 6, description_en: 'Upper dies / Lower dies normal state or not.', description_id: 'Upper dies / lower dies dalam keadaan normal atau tidak.' },
        { no: 7, description_en: 'Stopper block damaged or not.', description_id: 'Stopper block rusak atau tidak.' },
        { no: 8, description_en: 'The support pole is welded Cushion, damaged or not.', description_id: 'Isi bantalan tiang cushion rusak atau tidak.' },
        { no: 9, description_en: 'The area with a slide or Wear plate scuff marks broken or not.', description_id: 'Area slide atau penanda wear plate rusak atau tidak.' },
    ],
    pierce: [
        { no: 1, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, cacat atau tidak.' },
        { no: 2, description_en: 'The state Stripper pad bent, deformed or not.', description_id: 'Keadaan dari striper plate, bengkok, cacat atau tidak.' },
        { no: 3, description_en: 'Guide post Guide Bush state, normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 4, description_en: 'The condition of the cutting edge Punch pierce cracking, chipping, broken, or not and check the clearance.', description_id: 'Kondisi dari pisau potong, punch piercing retak, gompel, patah atau tidak dan cek clearance.' },
        { no: 5, description_en: 'The state Button dies cracking, chipping or not and check the clearance.', description_id: 'Keadaan button dies retak, gompel atau tidak dan cek clearance.' },
        { no: 6, description_en: 'Spring damaged, broken, bent, or not.', description_id: 'Spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 7, description_en: 'The state of Retainer not loose. Use can work normally or not.', description_id: 'Keadaan dari retainer tidak hilang, dapat digunakan normal atau tidak.' },
        { no: 8, description_en: 'HOOK have damaged available?', description_id: 'HOOK terdapat kerusakan.' },
        { no: 9, description_en: 'Air Cylinder for shoulder punch, there are normal or not.', description_id: 'Cylinder angin untuk shoulder punch, normal atau tidak.' },
    ],
    cam_pierce: [
        { no: 1, description_en: 'The state Upper plate Lower plate, bent, deformed or not.', description_id: 'Keadaan dari upper plate lower plate, bengkok, cacat atau tidak.' },
        { no: 2, description_en: 'The state Stripper pad bent, deformed or not.', description_id: 'Keadaan dari striper plate, bengkok, cacat atau tidak.' },
        { no: 3, description_en: 'Guide post Guide Bush state, normal?', description_id: 'Guide post guide bush keadaan normal.' },
        { no: 4, description_en: 'The condition of the cutting edge Punch pierce cracking, chipping, broken, or not and check the clearance.', description_id: 'Kondisi dari pisau potong, punch piercing retak, gompel, patah atau tidak dan cek clearance.' },
        { no: 5, description_en: 'The state Button dies cracking, chipping or not and check the clearance.', description_id: 'Keadaan button dies retak, gompel atau tidak dan cek clearance.' },
        { no: 6, description_en: 'Spring damaged, broken, bent, or not.', description_id: 'Spring rusak, pecah, bengkok, rusak keadaan normal.' },
        { no: 7, description_en: 'The state of Retainer not loose. Use can work normally or not.', description_id: 'Keadaan dari retainer tidak hilang, dapat digunakan normal atau tidak.' },
        { no: 8, description_en: 'CAM unit slider and driver condition normal or not.', description_id: 'Kondisi CAM unit slider dan driver normal atau tidak.' },
        { no: 9, description_en: 'Air Cylinder for shoulder punch and CAM, normal or not.', description_id: 'Cylinder angin untuk shoulder punch dan CAM, normal atau tidak.' },
    ],
};

export const getChecklistItems = (processType) => {
    return CHECKLIST_ITEMS[processType] || [];
};

export const getProcessTypeLabel = (processType) => {
    const found = PROCESS_TYPES.find(p => p.value === processType);
    return found ? found.label : processType?.toUpperCase() || '-';
};

export const initializeChecklistResults = (processType) => {
    const items = getChecklistItems(processType);
    return items.map(item => ({
        item_no: item.no,
        description: item.description_en,
        result: 'normal',
        remark: '',
    }));
};
