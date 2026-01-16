
export class UsbPrinterService {
    constructor() {
        this.device = null;
        this.interfaceNumber = 0; // Usually 0 for printers
        this.endpointOut = 1;     // Usually endpoint 1 is OUT for printers, we'll auto-detect
    }

    async connect() {
        try {
            // Request device - User must interact
            this.device = await navigator.usb.requestDevice({
                filters: [{ classCode: 7 }] // 7 = Printer Class
                // We can also filter by vendorId if we knew it (e.g. XPrinter often 0x0416 or similar)
            });

            console.log('Device selected:', this.device);
            await this.open();
            return true;
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    }

    async open() {
        if (!this.device) throw new Error("No device selected");

        await this.device.open();
        await this.device.selectConfiguration(1);

        // Find interface and endpoint
        const iface = this.device.configuration.interfaces.find(i =>
            i.alternates[0].interfaceClass === 7 // Printer class
        ) || this.device.configuration.interfaces[0];

        this.interfaceNumber = iface.interfaceNumber;
        await this.device.claimInterface(this.interfaceNumber);

        const endpoint = iface.alternates[0].endpoints.find(e => e.direction === 'out');
        this.endpointOut = endpoint ? endpoint.endpointNumber : 1;

        console.log(`Interface: ${this.interfaceNumber}, Endpoint: ${this.endpointOut}`);
    }

    async print(data) {
        if (!this.device) throw new Error("Printer not connected");

        if (!this.device.opened) {
            await this.open();
        }

        try {
            // Send data
            await this.device.transferOut(this.endpointOut, data);
        } catch (error) {
            console.error('Print error:', error);
            // Try to reconnect?
            throw error;
        }
    }

    async disconnect() {
        if (this.device) {
            await this.device.close();
        }
        this.device = null;
    }
}

export const usbPrinter = new UsbPrinterService();
