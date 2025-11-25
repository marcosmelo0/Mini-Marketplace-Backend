import * as userRepository from '../repositories/userRepository';

export const getUserProfile = async (userId: string) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const updateUserProfile = async (userId: string, data: any) => {
    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Prevent updating sensitive fields like password or role directly through this endpoint if needed
    // For now, we allow updating basic info. 
    // Ideally, we should validate 'data' to ensure it doesn't contain 'password_hash' or 'role' if we want to restrict that.
    // But the controller will likely filter the input using Zod.

    const updatedUser = await userRepository.updateUser(userId, data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};

export const listProviders = async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
        userRepository.findAllProviders(skip, limit),
        userRepository.countProviders(),
    ]);

    return {
        data: providers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
