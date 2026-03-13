const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /'✅ Ya, Confirm'/g, text: "'✅ Yes, Confirm'" },
    { regex: /'🔧 Ya, Butuh Repair'/g, text: "'🔧 Yes, Needs Repair'" },
    { regex: /'▶️ Ya, Lanjutkan'/g, text: "'▶️ Yes, Resume'" },
    { regex: /'🏭 Ya, Transfer'/g, text: "'🏭 Yes, Transfer'" },
    { regex: /'Lanjutkan Proses/g, text: "'Resume Process" },
    { regex: /'Transfer Kembali/g, text: "'Transfer Back" },
    { regex: /'✅ Ya, Selesai'/g, text: "'✅ Yes, Complete'" },
    { regex: /'❌ Ya, Batalkan'/g, text: "'❌ Yes, Cancel'" },
    { regex: /'Batalkan Jadwal'/g, text: "'Cancel Schedule'" },
    { regex: /'Setujui Jadwal'/g, text: "'Approve Schedule'" },
    { regex: /Nama yang set/g, text: "Setter's Name" },
    { regex: /Batal pilih/g, text: "Deselect" },
    { regex: /Jelaskan alasan/g, text: "Explain the reason" },
    { regex: /'Tidak ada die /g, text: "'No dies " },
    { regex: /'Berhasil /g, text: "'Successfully " },
    { regex: /'Gagal :/g, text: "'Failed :" },
    { regex: />Batal</g, text: ">Cancel<" },
    { regex: />Simpan</g, text: ">Save<" },
    { regex: />Tambah</g, text: ">Add<" },
    { regex: />Ubah</g, text: ">Edit<" },
    { regex: />Hapus</g, text: ">Delete<" },
    { regex: />Kembali</g, text: ">Back<" },
    { regex: />Proses</g, text: ">Process<" },
    { regex: />Selesai</g, text: ">Complete<" },
    { regex: />Detail</g, text: ">Details<" },
    { regex: />Menunggu</g, text: ">Waiting<" },
    { regex: />Pilih</g, text: ">Select<" },
    { regex: />Cari/g, text: ">Search" },
    { regex: />Aksi</g, text: ">Actions<" },
    { regex: />Status</g, text: ">Status<" },
    { regex: /Belum ada die/g, text: "No dies yet" },
    { regex: /Belum ada data/g, text: "No data yet" },
    { regex: /Belum ada/g, text: "Not yet available" },
    { regex: /Ya, Yakin/g, text: "Yes, I am sure" },
    { regex: /Tandai die/g, text: "Mark die" },
    { regex: /membutuhkan additional repair/g, text: "as needing additional repair" },
    { regex: /PPM akan dilanjutkan setelah repair selesai/g, text: "PPM will resume after repair is completed" },
];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

walk('resources/js', function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        
        for (let rep of replacements) {
            newContent = newContent.replace(rep.regex, rep.text);
        }

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated ' + filePath);
        }
    }
});
