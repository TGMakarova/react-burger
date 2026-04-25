import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { clearSelectedIngredient } from '@/services/slices/selectedIngredientSlice';

import { IngredientDetailsContent } from '../ingredient-details-content/ingredient-details-content';
import { Modal } from '../modal/modal';

import type { RootState, AppDispatch } from '@/services/store';

type IngredientDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: string | null;
};

export const IngredientDetails = ({
  children,
  header,
  isOpen,
  onClose,
}: IngredientDetailsProps): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const ingredient = useSelector(
    (state: RootState) => state.selectedIngredient.ingredient
  );

  const handleClose = () => {
    dispatch(clearSelectedIngredient());
    onClose();
    navigate(-1); // Возвращаемся назад
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
