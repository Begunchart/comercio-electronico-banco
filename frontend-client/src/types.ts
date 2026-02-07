export interface User {
    username: string;
    full_name?: string;
    role: string;
    cedula?: string;
    phone?: string;
}

export interface Account {
    id: number;
    user_id: number;
    account_number: string;
    balance: number;
}

export interface Card {
    card_number: string;
    expiry: string;
    cvv: string;
    // Generated on frontend for UI if needed, or we can map it
    color?: string;
    type?: 'visa' | 'mastercard';
    cardHolder?: string;
    balance?: number; // Visual only, linked to account logic
    limit?: number;   // n/a for debit
}

export interface Transaction {
    id: number;
    amount: number;
    transaction_type: 'transfer_in' | 'transfer_out' | 'purchase' | 'deposit';
    description: string;
    timestamp: string;
    related_account_id?: number;
}

export interface Beneficiary {
    id: number;
    name: string;
    account_number: string;
    alias?: string;
    bank_name: string;
    cedula?: string;
    phone?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: number;
    timestamp: string;
}
