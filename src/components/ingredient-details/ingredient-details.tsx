import { useNavigate } from 'react-router-dom';

import { clearSelectedIngredient } from '@/services/slices/selectedIngredientSlice';

import { useSelector, useDispatch } from '../../hooks/customHooks';
import { IngredientDetailsContent } from '../ingredient-details-content/ingredient-details-content';
import { Modal } from '../modal/modal';

type IngredientDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: string | null;
};

export const IngredientDetails = ({
  children: _children,
  header,
  isOpen,
  onClose,
}: IngredientDetailsProps): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ingredient = useSelector((state) => state.selectedIngredient.ingredient);

  const handleClose = (): void => {
    dispatch(clearSelectedIngredient());
    onClose();
    void navigate(-1); // Возвращаемся назад
  };

  if (!ingredient) {
    return <></>;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} header={header}>
      <IngredientDetailsContent ingredient={ingredient} />
    </Modal>
  );
};
